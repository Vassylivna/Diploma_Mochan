package com.mochan.traveltime.data;

import com.mochan.traveltime.model.Location;
import com.mochan.traveltime.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Order(1)
@Profile("!test")
public class LocationDataSeeder implements CommandLineRunner {

    private final LocationRepository locationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (locationRepository.count() > 0) {
            return;
        }

        System.out.println("Завантаження локацій...");

        List<Location> locations = Arrays.asList(
            // --- Західна Європа ---
            Location.builder() // id: 1
                .countryName("Франція")
                .cityName("Париж")
                .regionName("Західна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 3
                .countryName("Франція")
                .cityName("Ніцца")
                .regionName("Західна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 4
                .countryName("Німеччина")
                .cityName("Берлін")
                .regionName("Західна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 5
                .countryName("Німеччина")
                .cityName("Мюнхен")
                .regionName("Західна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 6
                .countryName("Нідерланди")
                .cityName("Амстердам")
                .regionName("Західна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 7
                .countryName("Бельгія")
                .cityName("Брюссель")
                .regionName("Західна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 8
                .countryName("Велика Британія")
                .cityName("Лондон")
                .regionName("Західна Європа")
                .isDeleted(false)
                .build(),

            // --- Південна Європа ---
            Location.builder() // id: 2 (Вставиться під новим авто-ID)
                .countryName("Греція")
                .cityName("Афіни")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 9
                .countryName("Греція")
                .cityName("Салоніки")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 10
                .countryName("Італія")
                .cityName("Рим")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 11
                .countryName("Італія")
                .cityName("Венеція")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 12
                .countryName("Італія")
                .cityName("Мілан")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 13
                .countryName("Іспанія")
                .cityName("Барселона")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 14
                .countryName("Іспанія")
                .cityName("Мадрид")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 15
                .countryName("Португалія")
                .cityName("Лісабон")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 16
                .countryName("Хорватія")
                .cityName("Дубровник")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build(),

            // --- Центральна та Східна Європа ---
            Location.builder() // id: 17
                .countryName("Чехія")
                .cityName("Прага")
                .regionName("Центральна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 18
                .countryName("Австрія")
                .cityName("Відень")
                .regionName("Центральна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 19
                .countryName("Угорщина")
                .cityName("Будапешт")
                .regionName("Центральна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 20
                .countryName("Польща")
                .cityName("Краків")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 21
                .countryName("Польща")
                .cityName("Варшава")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 22
                .countryName("Польща")
                .cityName("Закопане")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            // --- Україна ---
            Location.builder() // id: 23
                .countryName("Україна")
                .cityName("Київ")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 24
                .countryName("Україна")
                .cityName("Львів")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 25
                .countryName("Україна")
                .cityName("Одеса")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 26
                .countryName("Україна")
                .cityName("Івано-Франківськ")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 27
                .countryName("Україна")
                .cityName("Яремче")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 28
                .countryName("Україна")
                .cityName("Буковель")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 29
                .countryName("Україна")
                .cityName("Ужгород")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 30
                .countryName("Україна")
                .cityName("Мукачево")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 31
                .countryName("Україна")
                .cityName("Кам’янець-Подільський")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 32
                .countryName("Україна")
                .cityName("Чернівці")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 33
                .countryName("Україна")
                .cityName("Вінниця")
                .regionName("Центрально-Східна Європа")
                .isDeleted(false)
                .build(),

            Location.builder() // id: 34 (Виправлено swap: Стамбул - це місто)
                .countryName("Туреччина")
                .cityName("Стамбул")
                .regionName("Південна Європа")
                .isDeleted(false)
                .build()
        );

        locationRepository.saveAll(locations);
        System.out.println("Локації успішно завантажено в базу даних!");
    }
}