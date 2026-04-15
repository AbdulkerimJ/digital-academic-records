import swaggerJSDoc from "swagger-jsdoc";

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
        description: "Development server",
      },
    ],

    // 🔐 Prepare for future auth
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  // Scan swagger docs files
  apis: ["./docs/*.swagger.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
