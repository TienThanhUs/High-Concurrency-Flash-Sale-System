package com.hcmus.FlashMart_API;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class FlashMartApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
