import { CreationOptional, Model } from "sequelize";

export class Messages extends Model {
  declare id: CreationOptional<string>;
  declare userId: string;
}
