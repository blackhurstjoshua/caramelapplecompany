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
  
  // Handle both camelCase and snake_case property names
  // Snake case is the database format, camel case is the format we use in the code
  constructor(data: any) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.imagePath = data.imagePath || data.image_path;
    this.isWeeklySpecial = data.isWeeklySpecial ?? data.is_weekly_special;
    this.priceCents = data.priceCents ?? data.price_cents;
    this.isActive = data.isActive ?? data.is_active;
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  toDollars() {
    return this.priceCents / 100;
  }
}
