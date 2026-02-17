import bcrypt from "bcryptjs";

async function testBcrypt() {
    const password = "admin"; // I'll guess it's 'admin' or 'password'
    const hash = "$2y$10$pwfH4mEihNsc2bD4gheroeEd.M1.FnLs8N.3AYzaWHrwYhw7Bd29S";

    try {
        console.log("Testing with 'admin'...");
        const result1 = await bcrypt.compare("admin", hash);
        console.log("Result 1:", result1);

        console.log("Testing with 'password'...");
        const result2 = await bcrypt.compare("password", hash);
        console.log("Result 2:", result2);
    } catch (error) {
        console.error("Bcrypt failed:", error);
    }
}

testBcrypt();
