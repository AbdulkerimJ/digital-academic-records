import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`,
  );
  console.log(`Swagger docs on http://localhost:${PORT}/app/api-docs`);
});
