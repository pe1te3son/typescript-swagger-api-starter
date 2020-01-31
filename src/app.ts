import express from 'express';
import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import { create } from 'swagger-node-runner';
import swaggerUi from 'swagger-ui-express';
import { resolve } from 'path';
import { dereference } from 'json-schema-ref-parser';
import morgan from 'morgan';

class ExpressApi {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.configure();
  }

  async configure(): Promise<void> {
    const swaggerConfig = await this.getSwaggerConfiguration();
    create(swaggerConfig, (err, swagger) => {
      if (err) { throw (err); }
      this.setupAuthentication();
      this.configureMidleware();
      this.intiateSwaggerUi(swaggerConfig.swagger);
      swagger.expressMiddleware().register(this.app);
    });
  }

  private intiateSwaggerUi(schema: any) {
    this.app.use('/v1/powerapps/api-docs', swaggerUi.serve, swaggerUi.setup(schema, true));
  }

  private async getSwaggerConfiguration(): Promise<{appRoot: string, swagger: Object}> {
    const jsonSchema = await dereference(resolve(__dirname, 'swagger.json'));
    return {
      appRoot: __dirname,
      swagger: jsonSchema
    };
  }

  private configureMidleware(): void {
    this.app.use(morgan('combined'));
    this.app.use(json({ limit: '50mb' }));
    this.app.use(compression());
    this.app.use(urlencoded({ limit: '50mb', extended: true }));
  }

  private setupAuthentication() {
    this.app.use((req: Express.Request, res: Express.Response, next) => {
      // Implement authentication here
      next();
    });
  }
}

export default new ExpressApi().app;
