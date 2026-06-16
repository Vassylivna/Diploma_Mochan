package com.mochan.traveltime.data;

import com.mochan.traveltime.model.Transport;
import com.mochan.traveltime.repository.TransportRepository;
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
@Order(2)
@Profile("!test")
public class TransportDataSeeder implements CommandLineRunner {

    private final TransportRepository transportRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (transportRepository.count() > 0) {
            return;
        }

        System.out.println("Завантаження даних транспорту...");

        List<Transport> transports = Arrays.asList(
            // --- АВТОБУСИ ---
            Transport.builder()
                .transportName("Автобус")
                .transportNumber("BC 4590 AA")
                .description("Великий і зручний автобус для довгих мандрівок. Крісла м’які, їх можна відхилити назад, щоб поспати, або трохи відсунути вбік для зручності. У салоні завжди приємна температура: взимку тепло, а влітку прохолодно. Над кожним сидінням є своє світло.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Автобус")
                .transportNumber("AA 1256 KA")
                .description("Цей автобус їде дуже м’яко і тихо, тому ви зможете добре виспатися в дорозі. Через великі вікна зручно роздивлятися краєвиди. А щоб не нудьгувати, у салоні є телевізор, де показують цікаві фільми.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Автобус")
                .transportNumber("AI 3344 BT")
                .description("Невеликий автобус для маленьких груп. Він легко проїде вузькими вуличками та дістанеться туди, куди не заїде великий транспорт. Тут затишно, майже як у власному авто, і водій завжди почує ваші прохання.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Автобус")
                .transportNumber("KA 7890 BC")
                .description("Автобус підвищеної зручності. Тут більше місця між рядами, тому ногам буде вільно навіть високим людям. Є безкоштовний інтернет і місце, де можна зробити собі каву або чай, щоб дорога була приємнішою.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Автобус")
                .transportNumber("BO 5511 CP")
                .description("Надійний автобус, у якому не чути шуму дороги. Повітря всередині постійно оновлюється, тому дихати легко. Сидіння повторюють форму тіла, щоб спина не боліла, а у великий багажник влізуть усі ваші валізи.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Автобус")
                .transportNumber("CE 2100 AH")
                .description("Двоповерховий автобус. Подорож на другому поверсі — це найкращі краєвиди з висоти. Всередині є туалет, тому не треба чекати зупинки. Автобус великий і стійкий, тож його майже не гойдає.")
                .isDeleted(false)
                .build(),

            // --- ЛІТАКИ ---
            Transport.builder()
                .transportName("Літак")
                .transportNumber("W6 2341")
                .description("Сучасний літак, який швидко доставить вас на відпочинок. Зручні сидіння та привітні стюардеси зроблять переліт легким. Ми обрали цей рейс, щоб ви не переплачували за квитки, але отримали якісну послугу.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Літак")
                .transportNumber("FR 7812")
                .description("Прямий переліт без пересадок. Ми підібрали зручний час вильоту, щоб ви прилетіли не вночі, а вдень і мали час на прогулянку. Літак новий і надійний, виліт і посадка чітко за розкладом.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Літак")
                .transportNumber("LH 1492")
                .description("Літак від відомої надійної авіакомпанії. Тут про вас дбають по-особливому: смачно нагодують, запропонують напої та дадуть плед, якщо стане прохолодно. Місця для ніг достатньо, політ пройде спокійно.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Літак")
                .transportNumber("TK 3455")
                .description("Великий літак для довгих перельотів. У спинці кожного крісла є екран, тож можна дивитися кіно або слухати музику всю дорогу. Крісла дуже зручні, а їжа смачна і гаряча.")
                .isDeleted(false)
                .build(),

            // --- ПОЇЗДИ ---
            Transport.builder()
                .transportName("Поїзд")
                .transportNumber("IC+ 705")
                .description("Швидкісний поїзд, який ніколи не спізнюється. У вагонах чисто, просторо і працює кондиціонер. Є зручні столики, тож можна перекусити або почитати книгу. Поїздка проходить швидко і непомітно.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Поїзд")
                .transportNumber("015 К")
                .description("Поїзд зі спальними місцями (купе). Ви отримуєте чисту постіль і можете лягти спати ввечері, а прокинутися вже на місці призначення. Провідник обов'язково запропонує гарячий чай. Найкращий вибір, щоб не втрачати день на дорогу.")
                .isDeleted(false)
                .build(),

            Transport.builder()
                .transportName("Поїзд")
                .transportNumber("REG 802")
                .description("Зручний поїзд для поїздок на невеликі відстані. Через великі чисті вікна приємно дивитися на природу. Сидіння м’які, є куди покласти сумки. Чудовий варіант для короткої подорожі.")
                .isDeleted(false)
                .build()
        );

        transportRepository.saveAll(transports);
        System.out.println("Транспорт успішно завантажено в базу даних!");
    }
}