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
    tags: [
      {
        name: "Admin",
        description: "Endpoints accessible only to SUPER_ADMIN users",
      },
      {
        name: "Users",
        description: "Application user authentication and profile endpoints",
      },
      {
        name: "Students",
        description: "Student authentication and profile endpoints",
      },
      {
        name: "Institutions",
        description: "Institution management endpoints",
      },
      {
        name: "Citizens",
        description: "Citizen lookup endpoints",
      },
      {
        name: "Health",
        description: "Service health check endpoint",
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
