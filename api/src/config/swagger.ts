import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Document Intelligence Platform API",
      version: "1.0.0",
      description:
        "API documentation for authentication, document uploads, chats, messages, and health checks.",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Request successful" },
            data: { nullable: true },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Bad Request" },
            error: { type: "string", example: "Invalid request" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "string",
              example: "Validation Error, invalid request payload",
            },
            message: { type: "string", example: "Invalid data" },
            validationError: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string", example: "body.email" },
                  message: { type: "string", example: "Invalid email address" },
                },
              },
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalItems: { type: "integer", example: 42 },
            totalPages: { type: "integer", example: 5 },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Shiva" },
            email: { type: "string", format: "email" },
            gravatarUrl: { type: "string", nullable: true },
            role: { type: "string", enum: ["user", "admin"] },
            isBlocked: { type: "boolean" },
            isEmailVerified: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Shiva" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["user", "admin"] },
            isBlocked: { type: "boolean" },
            isEmailVerified: { type: "boolean" },
            gravatarUrl: { type: "string", nullable: true },
          },
        },
        Document: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            filename: { type: "string", example: "report.pdf" },
            fileType: { type: "string", enum: ["pdf", "docx", "txt", "csv"] },
            filePath: { type: "string", example: "uploads/report.pdf" },
            fileSize: { type: "integer", example: 204800 },
            fileProcessingStatus: {
              type: "string",
              enum: ["Processing", "Processed", "Failed"],
            },
            uploadedBy: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Chat: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string", example: "New chat" },
            userId: { type: "string", format: "uuid" },
            count: { type: "integer", example: 0 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Message: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            chatId: { type: "string", format: "uuid" },
            content: { type: "string", example: "Summarize the document." },
            messageRole: { type: "string", enum: ["user", "ai"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Log: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            action: { type: "string", example: "document_uploaded" },
            data: { type: "string", example: "Uploaded quarterly-report.pdf" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Stats: {
          type: "object",
          properties: {
            totalDocuments: { type: "integer", example: 12 },
            totalChunks: { type: "integer", example: 320 },
            totalSize: { type: "integer", nullable: true, example: 1048576 },
            totalUsers: { type: "integer", example: 4 },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Missing or invalid bearer token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        ForbiddenError: {
          description: "Authenticated user does not have permission",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        ValidationError: {
          description: "Invalid request payload, params, or query",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
});
