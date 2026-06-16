package com.mochan.traveltime.data;

import com.mochan.traveltime.model.Hotel;
import com.mochan.traveltime.model.HotelImage;
import com.mochan.traveltime.model.Location;
import com.mochan.traveltime.repository.HotelRepository;
import com.mochan.traveltime.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Order(4)
@Profile("!test")
public class HotelDataSeeder implements CommandLineRunner {

    private final HotelRepository hotelRepository;
    private final LocationRepository locationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (hotelRepository.count() > 0) {
            return;
        }

        System.out.println("Завантаження готелів...");

        // --- ПАРИЖ (Франція) ---
        createHotel(
            "Париж", // Шукаємо локацію за назвою міста
            "Maison de Charme",
            4,
            "Затишний готель у старовинному будинку. З вікон видно типові паризькі дахи та чути аромат свіжої випічки з пекарні внизу. Номери невеликі, але дуже світлі, оформлені у пастельних тонах. Ідеальне місце для романтичного вікенду.",
            new String[]{
                "/assets/paris_hotel_4_stars/1.jpg",
                "/assets/paris_hotel_4_stars/2.jpg",
                "/assets/paris_hotel_4_stars/3.jpg",
                "/assets/paris_hotel_4_stars/4.jpg",
                "/assets/paris_hotel_4_stars/5.jpg"
            }
        );

        // --- НІЦЦА (Франція) ---
        createHotel(
            "Ніцца",
            "Azure Riviera Hotel",
            5,
            "Готель на першій лінії біля моря. Ви прокидаєтесь під шум хвиль і снідаєте на терасі, залитій сонцем. Інтер'єр виконаний у білих та блакитних кольорах, щоб ви відчували прохолоду навіть у спеку. Є власний вихід на пляж.",
            new String[]{
                "/assets/nice_hotel_5_stars/1.jpg",
                "/assets/nice_hotel_5_stars/2.jpg",
                "/assets/nice_hotel_5_stars/3.jpg",
                "/assets/nice_hotel_5_stars/4.jpg",
                "/assets/nice_hotel_5_stars/5.jpg"
            }
        );

        // --- РИМ (Італія) ---
        createHotel(
            "Рим",
            "Antica Roma Residence",
            3,
            "Невеликий сімейний готель поруч із Колізеєм. Кам'яні стіни, дерев'яні балки на стелі та внутрішній дворик з фонтаном створюють атмосферу давнини. Господарі самі готують каву для гостей і радо підкажуть найкращі піцерії поруч.",
            new String[]{
                "/assets/rome_hotel_3_stars/1.jpg",
                "/assets/rome_hotel_3_stars/2.jpg",
                "/assets/rome_hotel_3_stars/3.jpg",
                "/assets/rome_hotel_3_stars/4.jpg"
            }
        );

        // --- ВЕНЕЦІЯ (Італія) ---
        createHotel(
            "Венеція",
            "Venetian Palazzo",
            4,
            "Готель розташований прямо на березі каналу. До входу можна підплисти на човні. У номерах старовинні меблі, люстри з муранського скла та важкі штори. Ввечері чути, як вода тихо хлюпає об стіни будинку.",
            new String[]{
                "/assets/venice_hotel_4_stars/1.jpg",
                "/assets/venice_hotel_4_stars/2.jpg",
                "/assets/venice_hotel_4_stars/3.jpg",
                "/assets/venice_hotel_4_stars/4.jpg"
            }
        );

        // --- ПРАГА (Чехія) ---
        createHotel(
            "Прага",
            "Golden Bridge Hotel",
            3,
            "Готель у самому серці старого міста, за хвилину ходьби від Карлового мосту. Будівля з червоним черепичним дахом. Сніданки тут дуже ситні, щоб ви мали сили гуляти весь день бруківкою. З верхніх поверхів відкривається панорама на все місто.",
            new String[]{
                "/assets/prague_hotel_3_stars/1.jpg",
                "/assets/prague_hotel_3_stars/2.jpg",
                "/assets/prague_hotel_3_stars/3.jpg",
                "/assets/prague_hotel_3_stars/4.jpg",
                "/assets/prague_hotel_3_stars/5.jpg"
            }
        );

        // --- ВІДЕНЬ (Австрія) ---
        createHotel(
            "Відень",
            "Imperial Opera",
            5,
            "Вишуканий готель у класичному стилі. Високі стелі, килими та картини на стінах нагадують про часи імператорів. Тут дуже тихо і спокійно. У лобі вечорами грає піаніст, а кава по-віденськи тут одна з найкращих у місті.",
            new String[]{
                "/assets/vienna_hotel_5_stars/1.jpg",
                "/assets/vienna_hotel_5_stars/2.jpg",
                "/assets/vienna_hotel_5_stars/3.jpg",
                "/assets/vienna_hotel_5_stars/4.jpg"
            }
        );

        // --- ЛЬВІВ (Україна) ---
        createHotel(
            "Львів",
            "Vintage Leopolis",
            4,
            "Атмосферний готель у центрі Львова. Тут пахне кавою та історією. Кожен номер має свій унікальний дизайн під старовину, але зі сучасною сантехнікою та зручним ліжком. З вікон видно Ратушу або затишний внутрішній дворик.",
            new String[]{
                "/assets/lviv_hotel_4_stars/1.jpg",
                "/assets/lviv_hotel_4_stars/2.jpg",
                "/assets/lviv_hotel_4_stars/3.jpg",
                "/assets/lviv_hotel_4_stars/4.jpg"
            }
        );

        // --- БУКОВЕЛЬ (Україна) ---
        createHotel(
            "Буковель",
            "Лісовий Затишок",
            4,
            "Дерев'яний котедж серед соснового лісу. Повітря тут неймовірно чисте. У готелі є теплий басейн під відкритим небом і сауна, де приємно погрітися після прогулянки горами. У ресторані подають страви з грибів та ягід, зібраних поруч.",
            new String[]{
                "/assets/bukovel_hotel_4_stars/1.jpg",
                "/assets/bukovel_hotel_4_stars/2.jpg",
                "/assets/bukovel_hotel_4_stars/3.jpg",
                "/assets/bukovel_hotel_4_stars/4.jpg"
            }
        );

        // --- СТАМБУЛ (Туреччина) ---
        createHotel(
            "Стамбул",
            "Sultan's Terrace",
            4,
            "Колоритний готель. Головна родзинка — тераса на даху, де подають сніданки з видом на блакитну мечеть і Босфор. У номерах є красиві килими та чайні набори. Тут ви відчуєте справжню східну гостинність.",
            new String[]{
                "/assets/istanbul_hotel_4_stars/1.jpg",
                "/assets/istanbul_hotel_4_stars/2.jpg",
                "/assets/istanbul_hotel_4_stars/3.jpg",
                "/assets/istanbul_hotel_4_stars/4.jpg"
            }
        );

        System.out.println("Готелі та фото успішно завантажено!");
    }

    private void createHotel(String cityName, String name, Integer stars, String description, String[] imageUrls) {
        // Знаходимо локацію по місту (щоб уникнути плутанини з ID)
        // Тобі треба буде додати метод findByCityName в LocationRepository, якщо його немає
        Optional<Location> locationOpt = locationRepository.findByCityName(cityName);
        
        if (locationOpt.isEmpty()) {
            System.out.println("⚠️ УВАГА: Локацію '" + cityName + "' не знайдено. Готель '" + name + "' пропущено.");
            return;
        }

        Hotel hotel = Hotel.builder()
                .location(locationOpt.get())
                .name(name)
                .stars(stars)
                .description(description)
                .isDeleted(false)
                .images(new HashSet<>()) // Ініціалізуємо сет
                .build();

        // Створюємо та додаємо картинки
        for (String url : imageUrls) {
            HotelImage image = HotelImage.builder()
                    .imageUrl(url)
                    .hotel(hotel) // Важливо встановити зв'язок
                    .build();
            hotel.getImages().add(image);
        }

        hotelRepository.save(hotel);
    }
}