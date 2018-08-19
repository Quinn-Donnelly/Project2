package com.revature.util;

import java.io.File;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.revature.utils.Constants;

public class WebDriverHelper {
	public static WebElement waitUntilVisible(WebDriver driver, String locator) {
		return new WebDriverWait(driver, 10).until(ExpectedConditions.elementToBeClickable(By.xpath(locator)));
	}

	public static WebDriver launchApplication(String url, boolean runHeadless) {
		File chrome = new File(Constants.pathToChromeExecutable);

		ChromeOptions options = new ChromeOptions();
		options.addArguments("window-size=1200x600");
		if (runHeadless) {
			options.addArguments("headless");
		}

		System.setProperty("webdriver.chrome.driver", chrome.getAbsolutePath());
		WebDriver driver = new ChromeDriver(options);
		driver.get(url);
		return driver;
	}

	public static Boolean waitForUrlToContain(WebDriver driver, String partialUrl) throws Exception {
		Boolean foundUrl = false;
		try {
			foundUrl = new WebDriverWait(driver, 15).until(ExpectedConditions.urlContains(partialUrl));
		} catch (TimeoutException e) {
			throw new Exception("Failed to load page");
		}

		return foundUrl;
	}
}
