package com.mochan.traveltime.service;

import com.mochan.traveltime.IntegrationTestBase;
import com.mochan.traveltime.dto.user.get.UserResponse;
import com.mochan.traveltime.dto.user.update.UpdatePasswordRequest;
import com.mochan.traveltime.dto.user.update.UpdateUserRequest;
import com.mochan.traveltime.exception.OperationNotAllowedException;
import com.mochan.traveltime.exception.PasswordMismatchException;
import com.mochan.traveltime.exception.ResourceConflictException;
import com.mochan.traveltime.exception.UserNotFoundException;
import com.mochan.traveltime.model.AccountStatus;
import com.mochan.traveltime.model.Role;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.repository.UserRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class UserServiceITest extends IntegrationTestBase {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldFetchUserSuccessfully() {
        User user = User.builder().firstName("User").email("user@gmail.com").role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        user = userRepository.save(user);

        UserResponse response = userService.getUser(user);

        Assertions.assertThat(response.getUserId()).isEqualTo(user.getUserId());
        Assertions.assertThat(response.getEmail()).isEqualTo("user@gmail.com");
    }

    @Test
    void shouldLoadUserByUsernameSuccessfully() {
        User user = User.builder().email("load@gmail.com").password("encoded").role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        userRepository.save(user);

        UserDetails userDetails = userService.loadUserByUsername("load@gmail.com");
        Assertions.assertThat(userDetails).isNotNull();
        Assertions.assertThat(userDetails.getUsername()).isEqualTo("load@gmail.com");
    }

    @Test
    void shouldThrowExceptionWhenUserNotFoundByEmail() {
        Assertions.assertThatThrownBy(() -> userService.loadUserByUsername("nonexistent@gmail.com"))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("Користувача з Email nonexistent@gmail.com не знайдено");
    }

    @Test
    void shouldUpdateProfileSuccessfully() {
        User user = User.builder().email("prof1@gmail.com").phoneNumber("+380999999999").role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        user = userRepository.save(user);

        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setPhoneNumber("+380999999991");

        UserResponse response = userService.updateProfile(user, updateRequest);
        Assertions.assertThat(response.getPhoneNumber()).isEqualTo("+380999999991");
    }

    @Test
    void shouldNotChangePhoneNumberWhenRequestPhoneNumberIsNull() {
        User user = User.builder().email("prof2@gmail.com").phoneNumber("++380999999999").role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        user = userRepository.save(user);

        UpdateUserRequest updateRequest = new UpdateUserRequest();

        UserResponse response = userService.updateProfile(user, updateRequest);
        Assertions.assertThat(response.getPhoneNumber()).isEqualTo("++380999999999");
    }


    @Test
    void shouldChangePasswordSuccessfully() {
        User user = User.builder().email("pass@gmail.com").password(passwordEncoder.encode("oldPass")).role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        user = userRepository.save(user);

        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("oldPass");
        request.setNewPassword("newPass");

        userService.changePassword(user, request);

        User updatedInDb = userRepository.findById(user.getUserId()).orElseThrow();
        Assertions.assertThat(passwordEncoder.matches("newPass", updatedInDb.getPassword())).isTrue();
    }

    @Test
    void shouldThrowExceptionWhenCurrentPasswordIsWrong() {
        User user = User.builder().email("wrong@gmail.com").password(passwordEncoder.encode("correct")).role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        user = userRepository.save(user);

        UpdatePasswordRequest request = new UpdatePasswordRequest();
        request.setCurrentPassword("wrong");
        request.setNewPassword("new");

        User finalUser = user;
        Assertions.assertThatThrownBy(() -> userService.changePassword(finalUser, request))
                .isInstanceOf(PasswordMismatchException.class)
                .hasMessage("Вказаний поточний пароль є невірним");
    }

    @Test
    void shouldGetAllUsersWithoutFilters() {
        userRepository.save(User.builder()
                .email("u1@gmail.com")
                .role(Role.USER)
                .accountStatus(AccountStatus.ACTIVE)
                .isDeleted(false)
                .build());
        userRepository.save(User.builder()
                .email("u2@gmail.com")
                .role(Role.GUIDE)
                .accountStatus(AccountStatus.BLOCKED)
                .isDeleted(false)
                .build());

        Page<UserResponse> page = userService.getAllUsers(null, null, null, null, null, PageRequest.of(0, 10));

        Assertions.assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(2);
    }

    @Test
    void shouldGetAllUsersWithSpecificRoleFilter() {
        userRepository.save(User.builder().email("u3@gmail.com").role(Role.USER).accountStatus(AccountStatus.ACTIVE).build());
        userRepository.save(User.builder().email("u4@gmail.com").role(Role.GUIDE).accountStatus(AccountStatus.ACTIVE).build());

        // Шукаємо тільки гідів
        Page<UserResponse> page = userService.getAllUsers(null, "GUIDE", null, null, null, PageRequest.of(0, 10));
        Assertions.assertThat(page.getContent()).allMatch(u -> u.getRole() == Role.GUIDE);
    }

    @Test
    void shouldUpdateUserByAdminSuccessfully() {
        User user = User.builder().email("adm1@gmail.com").role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        user = userRepository.save(user);

        UpdateUserRequest req = new UpdateUserRequest();
        req.setRole("GUIDE");
        req.setAccountStatus("BLOCKED");

        UserResponse response = userService.updateUserByAdmin(user.getUserId(), req);
        Assertions.assertThat(response.getRole()).isEqualTo(Role.GUIDE);
        Assertions.assertThat(response.getAccountStatus()).isEqualTo(AccountStatus.BLOCKED);
    }

    @Test
    void shouldUpdateUserByAdminWhenRoleAndStatusAreNull() {
        User user = User.builder().email("adm2@gmail.com").phoneNumber("+380999999999").role(Role.USER).accountStatus(AccountStatus.ACTIVE).build();
        user = userRepository.save(user);

        UpdateUserRequest req = new UpdateUserRequest();
        req.setPhoneNumber("+380999999991");

        UserResponse response = userService.updateUserByAdmin(user.getUserId(), req);
        Assertions.assertThat(response.getPhoneNumber()).isEqualTo("+380999999991");
        Assertions.assertThat(response.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void shouldNotThrowExceptionWhenAdminUpdatesGuideToGuideWithActiveTours() {
        User guide = User.builder().email("g1@gmail.com").role(Role.GUIDE).accountStatus(AccountStatus.ACTIVE).build();
        guide = userRepository.save(guide);
        jdbcTemplate.update("INSERT INTO tours (guideId, title, isDeleted, isArchived) VALUES (?, 'Tour', false, false)", guide.getUserId());

        UpdateUserRequest req = new UpdateUserRequest();
        req.setRole("GUIDE");
        req.setAccountStatus("BLOCKED");

        UserResponse response = userService.updateUserByAdmin(guide.getUserId(), req);
        Assertions.assertThat(response.getAccountStatus()).isEqualTo(AccountStatus.BLOCKED);
    }

    @Test
    void shouldThrowExceptionWhenChangingRoleOfGuideWithActiveTours() {
        User guide = User.builder()
                .email("g2@gmail.com")
                .role(Role.GUIDE)
                .accountStatus(AccountStatus.ACTIVE)
                .isDeleted(false)
                .build();
        guide = userRepository.save(guide);

        jdbcTemplate.update(
                "INSERT INTO tours (guideId, title, isDeleted, isArchived, endDate) VALUES (?, 'Tour', false, false, '2099-12-31 23:59:59')",
                guide.getUserId()
        );

        UpdateUserRequest req = new UpdateUserRequest();
        req.setRole("USER");

        User finalGuide = guide;
        Assertions.assertThatThrownBy(() -> userService.updateUserByAdmin(finalGuide.getUserId(), req))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessage("Неможливо змінити статус/роль гіда, у нього є активні тури");
    }

    @Test
    void shouldThrowExceptionWhenAdminUpdatesUnknownUser() {
        Assertions.assertThatThrownBy(() -> userService.updateUserByAdmin(9999L, new UpdateUserRequest()))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void shouldThrowExceptionWhenUpdatingMainAdmin() {
        jdbcTemplate.update("INSERT INTO users (userId, email, role, accountStatus, isDeleted) VALUES (1, 'admin@gmail.com', 'ADMIN', 'ACTIVE', 0) ON DUPLICATE KEY UPDATE email='admin@gmail.com'");

        Assertions.assertThatThrownBy(() -> userService.updateUserByAdmin(1L, new UpdateUserRequest()))
                .isInstanceOf(OperationNotAllowedException.class);
    }

    @Test
    void shouldDeleteUserSuccessfully() {
        User user = User.builder().email("del1@gmail.com").role(Role.USER).accountStatus(AccountStatus.ACTIVE).isDeleted(false).build();
        user = userRepository.save(user);

        userService.deleteUser(user.getUserId());

        Boolean isDeleted = jdbcTemplate.queryForObject("SELECT isDeleted FROM users WHERE userId = ?", Boolean.class, user.getUserId());
        Assertions.assertThat(isDeleted).isTrue();
    }

    @Test
    void shouldDeleteGuideSuccessfullyWhenNoActiveTours() {
        User guide = User.builder().email("del2@gmail.com").role(Role.GUIDE).accountStatus(AccountStatus.ACTIVE).isDeleted(false).build();
        guide = userRepository.save(guide);

        userService.deleteUser(guide.getUserId());

        Boolean isDeleted = jdbcTemplate.queryForObject("SELECT isDeleted FROM users WHERE userId = ?", Boolean.class, guide.getUserId());
        Assertions.assertThat(isDeleted).isTrue();
    }

    @Test
    void shouldThrowExceptionWhenDeletingGuideWithActiveTours() {
        User guide = User.builder()
                .email("del3@gmail.com")
                .role(Role.GUIDE)
                .accountStatus(AccountStatus.ACTIVE)
                .isDeleted(false)
                .build();
        guide = userRepository.save(guide);

        jdbcTemplate.update(
                "INSERT INTO tours (guideId, title, isDeleted, isArchived, endDate) VALUES (?, 'Tour', false, false, '2099-12-31 23:59:59')",
                guide.getUserId()
        );

        User finalGuide = guide;
        Assertions.assertThatThrownBy(() -> userService.deleteUser(finalGuide.getUserId()))
                .isInstanceOf(ResourceConflictException.class)
                .hasMessage("Неможливо видалити гіда, у нього є активні тури");
    }

    @Test
    void shouldThrowExceptionWhenDeletingUnknownUser() {
        Assertions.assertThatThrownBy(() -> userService.deleteUser(9999L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void shouldThrowExceptionWhenDeletingMainAdmin() {
        jdbcTemplate.update("INSERT INTO users (userId, email, role, accountStatus, isDeleted) VALUES (1, 'admin2@gmail.com', 'ADMIN', 'ACTIVE', 0) ON DUPLICATE KEY UPDATE email='admin2@gamil.com'");

        Assertions.assertThatThrownBy(() -> userService.deleteUser(1L))
                .isInstanceOf(OperationNotAllowedException.class);
    }
}