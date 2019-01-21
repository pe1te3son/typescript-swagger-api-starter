import express from 'express';
import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import { create } from 'swagger-express-mw';
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
      this.configureMidleware();
      this.setupAuthentication();
      swagger.register(this.app);
    });
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
    this.app.use((req, res, next) => {
      // Implement authentication here
      next();
    });
  }
}

export default new ExpressApi().app;
