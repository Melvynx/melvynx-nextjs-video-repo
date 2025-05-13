import { getServerUrl } from "@/lib/server-url";
import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto(`${getServerUrl()}`);

  await page.getByRole("link", { name: "SignIn" }).click();
  await page.getByRole("link", { name: "Sing Up" }).click();
  await page
    .getByRole("textbox", { name: "Full name" })
    .fill(faker.person.fullName());

  const email = faker.internet.email();
  await page.getByRole("textbox", { name: "Email" }).fill(email);

  await page
    .getByRole("textbox", { name: "Password" })
    .fill(faker.internet.password());

  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page).toHaveURL(/.*\/auth/);
  await expect(page.getByText(email)).toBeVisible();
});
