package com.mochan.traveltime;

import lombok.extern.slf4j.Slf4j;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.repository.CrudRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.jdbc.JdbcTestUtils;

import java.util.List;

@Slf4j
public abstract class IntegrationTestBase {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private List<CrudRepository<?, ?>> crudRepositories;

    @BeforeEach
    void deleteRecords() {
        Assertions.assertThat(datasourceUrl).endsWith("-test");
        log.debug("Removing data before test...");
        
       JdbcTestUtils.deleteFromTables(jdbcTemplate,
                "bookings",
                "tourrouteevents",
                "tourroutesteps",
                "tourinclusions",
                "tourimages",
                "tourstops",
                "hotelimages",
                "tours",
                "transports",
                "hotels",
                "locations",
                "users"
        );
        for (CrudRepository<?, ?> crudRepository : crudRepositories) {
            Assertions.assertThat(crudRepository.findAll()).isEmpty();
        }
        log.debug("Data removed!");
    }
}