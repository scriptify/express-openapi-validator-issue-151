import { prop, getModelForClass, setGlobalOptions } from '@typegoose/typegoose';

setGlobalOptions({
  globalOptions: {
    useNewEnum: true,
  },
});

enum PetType {
  cat = 'cat',
  dog = 'dog',
}

export class Pet {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  tag!: string;

  @prop({ enum: PetType, type: String })
  type?: PetType;
}

const PetModel = getModelForClass(Pet);

export default PetModel;
