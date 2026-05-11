import { CreationOptional, Model } from "sequelize";

export class Chat extends Model {
  declare id: CreationOptional<string>;
}
