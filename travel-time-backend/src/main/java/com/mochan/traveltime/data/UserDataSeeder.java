package com.mochan.traveltime.data;

import com.mochan.traveltime.model.AccountStatus;
import com.mochan.traveltime.model.Role;
import com.mochan.traveltime.model.User;
import com.mochan.traveltime.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Order(3)
@Profile("!test")
public class UserDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        System.out.println("Завантаження початкових даних користувачів...");

        List<User> users = Arrays.asList(
                // 1. ГОЛОВНИЙ АДМІНІСТРАТОР
                User.builder()
                        .firstName("Олександр")
                        .lastName("Адмінко")
                        .middleName("Олегович")
                        .birthDate(LocalDate.of(1988, 5, 20))
                        .phoneNumber("+380991234567")
                        .email("admin@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.ADMIN)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                // 2. ТЕСТОВИЙ ЮЗЕР
                User.builder()
                        .firstName("Тест")
                        .lastName("Юзерович")
                        .middleName("Тестовий")
                        .birthDate(LocalDate.of(2005, 1, 1))
                        .phoneNumber("+380111111111")
                        .email("user@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.USER)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                // 3. ГОЛОВНИЙ ГІД
                User.builder()
                        .firstName("Михайло")
                        .lastName("Гіденко")
                        .middleName("Гідович")
                        .birthDate(LocalDate.of(1990, 3, 15))
                        .phoneNumber("+380670000000")
                        .email("guide@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.GUIDE)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                // --- ДОДАТКОВІ ГІДИ ---
                User.builder()
                        .firstName("Олена")
                        .lastName("Коваль")
                        .middleName("Петрівна")
                        .birthDate(LocalDate.of(1985, 7, 12))
                        .phoneNumber("+380501112233")
                        .email("olena.guide@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.GUIDE)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                User.builder()
                        .firstName("Андрій")
                        .lastName("Ткаченко")
                        .middleName("Васильович")
                        .birthDate(LocalDate.of(1992, 11, 3))
                        .phoneNumber("+380634445566")
                        .email("andriy.guide@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.GUIDE)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                User.builder()
                        .firstName("Марія")
                        .lastName("Лисенко")
                        .middleName("Іванівна")
                        .birthDate(LocalDate.of(1995, 9, 21))
                        .phoneNumber("+380977778899")
                        .email("maria.guide@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.GUIDE)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                // --- ЗВИЧАЙНІ КОРИСТУВАЧІ ---
                User.builder()
                        .firstName("Іван")
                        .lastName("Петренко")
                        .middleName("Сергійович")
                        .birthDate(LocalDate.of(1998, 4, 10))
                        .phoneNumber("+380509990011")
                        .email("ivan.petrenko@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.USER)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                User.builder()
                        .firstName("Світлана")
                        .lastName("Бойко")
                        .middleName("Андріївна")
                        .birthDate(LocalDate.of(1982, 12, 5))
                        .phoneNumber("+380672223344")
                        .email("svitlana.boyko@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.USER)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                User.builder()
                        .firstName("Максим")
                        .lastName("Козак")
                        .middleName("Юрійович")
                        .birthDate(LocalDate.of(2000, 2, 28))
                        .phoneNumber("+380935556677")
                        .email("max.kozak@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.USER)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                User.builder()
                        .firstName("Софія")
                        .lastName("Гончар")
                        .middleName("Олександрівна")
                        .birthDate(LocalDate.of(1996, 6, 15))
                        .phoneNumber("+380998887766")
                        .email("sofia.honchar@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.USER)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                User.builder()
                        .firstName("Артем")
                        .lastName("Кравченко")
                        .middleName("Вікторович")
                        .birthDate(LocalDate.of(1990, 10, 30))
                        .phoneNumber("+380501239876")
                        .email("artem.krav@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.USER)
                        .accountStatus(AccountStatus.BLOCKED)
                        .isDeleted(false)
                        .build(),

                User.builder()
                        .firstName("Юлія")
                        .lastName("Романюк")
                        .middleName("Миколаївна")
                        .birthDate(LocalDate.of(2003, 8, 19))
                        .phoneNumber("+380630001122")
                        .email("yulia.romaniuk@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.USER)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build(),

                // --- ЩЕ ОДИН АДМІНІСТРАТОР ---
                User.builder()
                        .firstName("Вікторія")
                        .lastName("Сидоренко")
                        .middleName("Володимирівна")
                        .birthDate(LocalDate.of(1993, 1, 25))
                        .phoneNumber("+380689998877")
                        .email("admin.victoria@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .role(Role.ADMIN)
                        .accountStatus(AccountStatus.ACTIVE)
                        .isDeleted(false)
                        .build()
        );

        userRepository.saveAll(users);
        System.out.println("Користувачів успішно завантажено в базу даних!");
    }
}