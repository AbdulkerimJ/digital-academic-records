import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Digital Academic Record API",
      version: "1.0.0",
      description: "API for National ID-linked Academic Record System",
    },
    servers: [
      {
        url: "/",
        description: "Development server",
      },
    ],

    // Prepare for future auth
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
      },
    },
  },

  // Scan swagger docs files
  apis: [path.join(__dirname, "../../docs/*.swagger.js")],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
