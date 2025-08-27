import fs from 'fs';
import path from 'path';

interface JsonStore {
  users: any[];
  games: any[];
  bookings: any[];
  reviews: any[];
  messages: any[];
}

class JsonDatabase {
  private dataPath: string;
  private data!: JsonStore; // Using definite assignment assertion

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'db.json');
    this.ensureDataDirectory();
    this.loadData();
  }

  private ensureDataDirectory(): void {
    const dir = path.dirname(this.dataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const rawData = fs.readFileSync(this.dataPath, 'utf8');
        this.data = JSON.parse(rawData);
      } else {
        this.data = {
          users: [],
          games: [],
          bookings: [],
          reviews: [],
          messages: []
        };
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading JSON database:', error);
      this.data = {
        users: [],
        games: [],
        bookings: [],
        reviews: [],
        messages: []
      };
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving JSON database:', error);
    }
  }

  // Generic CRUD operations
  findAll(collection: keyof JsonStore): any[] {
    return this.data[collection] || [];
  }

  findById(collection: keyof JsonStore, id: string): any | null {
    const items = this.data[collection] || [];
    return items.find((item: any) => item.id === id || item._id === id) || null;
  }

  create(collection: keyof JsonStore, item: any): any {
    const items = this.data[collection] || [];
    const newItem = {
      ...item,
      _id: item._id || this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    items.push(newItem);
    this.data[collection] = items;
    this.saveData();
    return newItem;
  }

  update(collection: keyof JsonStore, id: string, updates: any): any | null {
    const items = this.data[collection] || [];
    const index = items.findIndex((item: any) => item.id === id || item._id === id);
    
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.data[collection] = items;
    this.saveData();
    return items[index];
  }

  delete(collection: keyof JsonStore, id: string): boolean {
    const items = this.data[collection] || [];
    const index = items.findIndex((item: any) => item.id === id || item._id === id);
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    this.data[collection] = items;
    this.saveData();
    return true;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Export singleton instance
export const jsonDb = new JsonDatabase();

// Mock mongoose-like interface for development
export const createMockModel = (collectionName: keyof JsonStore) => {
  return {
    find: (query: any = {}) => {
      const items = jsonDb.findAll(collectionName);
      if (Object.keys(query).length === 0) return Promise.resolve(items);
      
      // Simple query matching
      const filtered = items.filter((item: any) => {
        return Object.entries(query).every(([key, value]) => item[key] === value);
      });
      return Promise.resolve(filtered);
    },
    
    findById: (id: string) => {
      return Promise.resolve(jsonDb.findById(collectionName, id));
    },
    
    findOne: (query: any) => {
      const items = jsonDb.findAll(collectionName);
      const found = items.find((item: any) => {
        return Object.entries(query).every(([key, value]) => item[key] === value);
      });
      return Promise.resolve(found || null);
    },
    
    create: (data: any) => {
      return Promise.resolve(jsonDb.create(collectionName, data));
    },
    
    findByIdAndUpdate: (id: string, updates: any) => {
      return Promise.resolve(jsonDb.update(collectionName, id, updates));
    },
    
    findByIdAndDelete: (id: string) => {
      const deleted = jsonDb.delete(collectionName, id);
      return Promise.resolve(deleted ? { _id: id } : null);
    }
  };
};
