import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Fayda API",
      version: "1.0.0",
      description: "API for Fayda citizen lookup and OTP authentication",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
  },
  apis: [path.join(__dirname, "../docs/*.js")],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
