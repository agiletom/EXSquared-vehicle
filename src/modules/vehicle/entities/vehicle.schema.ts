import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@ObjectType() // GraphQL object type for vehicle types
class VehicleType {
  @Field(() => String)
  VehicleTypeId: string;

  @Field(() => String)
  VehicleTypeName: string;
}

@ObjectType() // GraphQL object type for Vehicle
@Schema()
export class Vehicle extends Document {
  @Field(() => String)
  @Prop()
  makeId: string;

  @Field(() => String)
  @Prop()
  makeName: string;

  @Field(() => [VehicleType])
  @Prop({ type: [{ VehicleTypeId: String, VehicleTypeName: String }] })
  vehicleTypes: VehicleType[];
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
