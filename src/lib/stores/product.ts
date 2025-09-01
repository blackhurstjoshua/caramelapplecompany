interface Apple {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  isWeeklySpecial: boolean;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  toDollars(): number;
}

export class Product implements Apple {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  isWeeklySpecial: boolean;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.imagePath = data.imagePath;
    this.isWeeklySpecial = data.isWeeklySpecial;
    this.priceCents = data.priceCents;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toDollars() {
    return this.priceCents / 100;
  }
}
