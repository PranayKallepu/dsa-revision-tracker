/**
 * OpenAPI 3.0.3 Specification for DSA Revision and Mastery Platform API.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "DSA Revision & Mastery Tracker API",
    version: "1.0.0",
    description:
      "Production REST API for tracking Data Structures and Algorithms problems, spaced repetition revision schedules, attempts, and mastery assessments.",
    contact: {
      name: "DSA Revision Tracker Support",
      url: "https://github.com/PranayKallepu/dsa-revision-tracker",
    },
  },
  servers: [
    {
      url: "/",
      description: "Current environment (relative)",
    },
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "System", description: "Health check and diagnostics" },
    { name: "Authentication", description: "User registration, session management, and auth tokens" },
    { name: "Problems", description: "User-owned DSA problem CRUD, search, filtering, and lifecycle management" },
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System"],
        summary: "System and Database Health Check",
        description: "Returns current service health, uptime, environment, and PostgreSQL database connectivity latency.",
        responses: {
          "200": {
            description: "Service is fully operational and database is connected.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthCheckResponse" },
              },
            },
          },
          "503": {
            description: "Service unavailable or database unreachable.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user account",
        description: "Validates user details, hashes password with bcrypt, and creates a persistent PostgreSQL user.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/User" },
                    message: { type: "string", example: "Account registered successfully. You may now sign in." },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Validation error or invalid request format.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email address already registered.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "422": {
            description: "Field validation error (e.g. password too short).",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/csrf": {
      get: {
        tags: ["Authentication"],
        summary: "Get CSRF Token",
        description: "Returns CSRF token and sets authjs.csrf-token cookie required for credential login requests.",
        responses: {
          "200": {
            description: "CSRF token returned successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    csrfToken: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/callback/credentials": {
      post: {
        tags: ["Authentication"],
        summary: "Sign in with email and password",
        description: "Authenticates credentials and establishes session cookie (authjs.session-token).",
        requestBody: {
          required: true,
          content: {
            "application/x-www-form-urlencoded": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated successfully; sets authjs.session-token cookie.",
          },
          "401": {
            description: "Invalid email or password.",
          },
        },
      },
    },
    "/api/problems": {
      get: {
        tags: ["Problems"],
        summary: "List User Problems",
        description: "Retrieves a paginated list of user-owned problems with optional keyword search, status filtering, difficulty filtering, and sorting.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            description: "Page number (1-based)",
            schema: { type: "integer", default: 1, minimum: 1 },
          },
          {
            name: "limit",
            in: "query",
            description: "Items per page (max: 100)",
            schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
          },
          {
            name: "search",
            in: "query",
            description: "Case-insensitive title or topic keyword search",
            schema: { type: "string" },
          },
          {
            name: "difficulty",
            in: "query",
            description: "Filter by difficulty",
            schema: { $ref: "#/components/schemas/Difficulty" },
          },
          {
            name: "platform",
            in: "query",
            description: "Filter by coding platform",
            schema: { $ref: "#/components/schemas/Platform" },
          },
          {
            name: "status",
            in: "query",
            description: "Filter by problem lifecycle status",
            schema: { $ref: "#/components/schemas/ProblemStatus" },
          },
          {
            name: "topic",
            in: "query",
            description: "Filter by topic name (e.g. 'Binary Search', 'Dynamic Programming')",
            schema: { type: "string" },
          },
          {
            name: "sortBy",
            in: "query",
            description: "Field to sort by",
            schema: {
              type: "string",
              enum: ["createdAt", "updatedAt", "title", "difficulty", "status", "originalSolvedAt"],
              default: "createdAt",
            },
          },
          {
            name: "sortOrder",
            in: "query",
            description: "Sort direction",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          "200": {
            description: "Problems retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Problem" },
                        },
                        meta: { $ref: "#/components/schemas/PaginationMeta" },
                      },
                    },
                    message: { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized. Authentication required.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Problems"],
        summary: "Create a Problem",
        description: "Creates a new problem record owned by the authenticated user and automatically links topics.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProblemInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Problem created successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Problem" },
                    message: { type: "string", example: "Problem created successfully" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid request payload format.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized. Please sign in.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "422": {
            description: "Schema validation error (missing required fields or invalid values).",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/problems/{problemId}": {
      get: {
        tags: ["Problems"],
        summary: "Get Problem Details",
        description: "Retrieves complete details for a single problem owned by the authenticated user, including topics, revision history, and attempts.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "problemId",
            in: "path",
            required: true,
            description: "Unique Problem ID (CUID or UUID)",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Problem details retrieved successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Problem" },
                    message: { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "404": {
            description: "Problem not found or belongs to another user.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Problems"],
        summary: "Update Problem",
        description: "Atomically updates problem attributes, notes, complexities, or topic associations for the owned problem.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "problemId",
            in: "path",
            required: true,
            description: "Unique Problem ID",
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProblemInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Problem updated successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Problem" },
                    message: { type: "string", example: "Problem updated successfully" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "404": {
            description: "Problem not found or not owned by caller.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "422": {
            description: "Validation error on update payload.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/problems/{problemId}/archive": {
      patch: {
        tags: ["Problems"],
        summary: "Archive Problem",
        description: "Soft-archives a problem by setting status to 'Archived' and recording an archivedAt timestamp without deleting user history.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "problemId",
            in: "path",
            required: true,
            description: "Unique Problem ID",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Problem archived successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Problem" },
                    message: { type: "string", example: "Problem archived successfully" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "404": {
            description: "Problem not found or belongs to another user.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/problems/{problemId}/restore": {
      patch: {
        tags: ["Problems"],
        summary: "Restore Problem",
        description: "Restores an archived problem back to 'Learning' status and clears the archivedAt timestamp.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "problemId",
            in: "path",
            required: true,
            description: "Unique Problem ID",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Problem restored successfully.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Problem" },
                    message: { type: "string", example: "Problem restored successfully" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          "404": {
            description: "Problem not found or belongs to another user.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      CookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "authjs.session-token",
        description: "Auth.js HTTP-only session cookie automatically set upon signing in.",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Optional JSON Web Token authorization header.",
      },
    },
    schemas: {
      Difficulty: {
        type: "string",
        enum: ["Easy", "Medium", "Hard"],
        example: "Medium",
      },
      Platform: {
        type: "string",
        enum: ["LeetCode", "GeeksforGeeks", "HackerRank", "Codeforces", "InterviewBit", "Other"],
        example: "LeetCode",
      },
      ProblemStatus: {
        type: "string",
        enum: ["Learning", "Reviewing", "Mastered", "Archived"],
        example: "Learning",
      },
      CreateProblemInput: {
        type: "object",
        required: ["title", "url", "platform", "difficulty", "topics"],
        properties: {
          title: { type: "string", example: "Two Sum" },
          url: { type: "string", format: "uri", example: "https://leetcode.com/problems/two-sum/" },
          platform: { $ref: "#/components/schemas/Platform" },
          difficulty: { $ref: "#/components/schemas/Difficulty" },
          topics: {
            type: "array",
            items: { type: "string" },
            example: ["Array", "Hash Table"],
          },
          approach: { type: "string", example: "Single-pass hash table lookup" },
          timeComplexity: { type: "string", example: "O(n)" },
          spaceComplexity: { type: "string", example: "O(n)" },
          notes: { type: "string", example: "Remember to check complementary values" },
          mistakes: { type: "string", example: "" },
          time: { type: "integer", minimum: 0, description: "Initial solve duration in minutes", example: 15 },
        },
      },
      UpdateProblemInput: {
        type: "object",
        properties: {
          title: { type: "string", example: "Two Sum" },
          url: { type: "string", format: "uri" },
          platform: { $ref: "#/components/schemas/Platform" },
          difficulty: { $ref: "#/components/schemas/Difficulty" },
          status: { $ref: "#/components/schemas/ProblemStatus" },
          topics: {
            type: "array",
            items: { type: "string" },
            example: ["Array", "Hash Table", "Math"],
          },
          approach: { type: "string" },
          timeComplexity: { type: "string" },
          spaceComplexity: { type: "string" },
          notes: { type: "string" },
          mistakes: { type: "string" },
          time: { type: "integer", minimum: 0, description: "Solve duration in minutes" },
        },
      },
      Problem: {
        type: "object",
        properties: {
          id: { type: "string", example: "cmw6ket2z0007dxro7vvc2o8e" },
          title: { type: "string", example: "Two Sum" },
          url: { type: "string", example: "https://leetcode.com/problems/two-sum/" },
          platform: { $ref: "#/components/schemas/Platform" },
          difficulty: { $ref: "#/components/schemas/Difficulty" },
          status: { $ref: "#/components/schemas/ProblemStatus" },
          topics: {
            type: "array",
            items: { type: "string" },
            example: ["Array", "Hash Table"],
          },
          time: { type: "integer", example: 15 },
          initialSolveDurationSeconds: { type: "integer", nullable: true, example: 900 },
          approach: { type: "string", example: "Hash map lookup" },
          timeComplexity: { type: "string", example: "O(n)" },
          spaceComplexity: { type: "string", example: "O(n)" },
          notes: { type: "string" },
          mistakes: { type: "string" },
          nextRevision: { type: "string", nullable: true, example: "Nov 14" },
          revision: { type: "integer", example: 0 },
          originalSolveDate: { type: "string", format: "date-time" },
          archivedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          total: { type: "integer", example: 42 },
          totalPages: { type: "integer", example: 5 },
          hasMore: { type: "boolean", example: true },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100, example: "Alex Chen" },
          email: { type: "string", format: "email", example: "alex@example.com" },
          password: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            description: "Must contain at least 8 characters, one letter, and one number",
            example: "Password123!",
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["csrfToken", "email", "password"],
        properties: {
          csrfToken: { type: "string" },
          email: { type: "string", format: "email", example: "alex@example.com" },
          password: { type: "string", example: "Password123!" },
          redirect: { type: "string", default: "false" },
          json: { type: "string", default: "true" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "cmw6jabc0000dxro12345678" },
          name: { type: "string", nullable: true, example: "Alex Chen" },
          email: { type: "string", example: "alex@example.com" },
          image: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      HealthCheckResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              status: { type: "string", example: "healthy" },
              database: {
                type: "object",
                properties: {
                  status: { type: "string", example: "connected" },
                  latencyMs: { type: "number", example: 24.5 },
                },
              },
              uptime: { type: "number", example: 124.5 },
              environment: { type: "string", example: "production" },
              timestamp: { type: "string", format: "date-time" },
            },
          },
          message: { type: "string", example: "Service is fully operational" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      ApiErrorDetail: {
        type: "object",
        properties: {
          field: { type: "string", example: "email" },
          message: { type: "string", example: "Please enter a valid email address." },
          code: { type: "string", example: "invalid_string" },
        },
      },
      ApiErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Request validation failed. Please review the provided fields." },
              details: {
                type: "array",
                items: { $ref: "#/components/schemas/ApiErrorDetail" },
              },
            },
          },
          timestamp: { type: "string", format: "date-time" },
        },
      },
    },
  },
} as const

