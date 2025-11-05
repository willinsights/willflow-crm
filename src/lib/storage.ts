import { Project, Client, User, Category } from './types';
import { mockProjects, mockClients, mockUsers, mockCategories } from './data';

// Storage em memória - em produção seria substituído por base de dados
class InMemoryStorage {
  private projects: Project[] = [...mockProjects];
  private clients: Client[] = [...mockClients];
  private users: User[] = [...mockUsers];
  private categories: Category[] = [...mockCategories];

  // Projetos
  getProjects(): Project[] {
    return this.projects;
  }

  getProject(id: string): Project | undefined {
    return this.projects.find(p => p.id === id);
  }

  addProject(project: Project): Project {
    this.projects.push(project);
    return project;
  }

  updateProject(id: string, updates: Partial<Project>): Project | null {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.projects[index];
  }

  deleteProject(id: string): boolean {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.projects.splice(index, 1);
    return true;
  }

  deleteProjects(ids: string[]): number {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(p => !ids.includes(p.id));
    return initialLength - this.projects.length;
  }

  // Clientes
  getClients(): Client[] {
    return this.clients;
  }

  getClient(id: string): Client | undefined {
    return this.clients.find(c => c.id === id);
  }

  addClient(client: Client): Client {
    this.clients.push(client);
    return client;
  }

  updateClient(id: string, updates: Partial<Client>): Client | null {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.clients[index] = {
      ...this.clients[index],
      ...updates
    };

    return this.clients[index];
  }

  deleteClient(id: string): boolean {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.clients.splice(index, 1);
    return true;
  }

  // Utilizadores
  getUsers(): User[] {
    return this.users;
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  addUser(user: User): User {
    this.users.push(user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.users[index] = {
      ...this.users[index],
      ...updates
    };

    return this.users[index];
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.users.splice(index, 1);
    return true;
  }

  // Categorias
  getCategories(): Category[] {
    return this.categories;
  }

  getCategory(id: string): Category | undefined {
    return this.categories.find(c => c.id === id);
  }

  addCategory(category: Category): Category {
    this.categories.push(category);
    return category;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.categories[index] = {
      ...this.categories[index],
      ...updates
    };

    return this.categories[index];
  }

  deleteCategory(id: string): boolean {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.categories.splice(index, 1);
    return true;
  }

  // Utilitários
  reset(): void {
    this.projects = [...mockProjects];
    this.clients = [...mockClients];
    this.users = [...mockUsers];
    this.categories = [...mockCategories];
  }

  getStats() {
    return {
      projects: this.projects.length,
      clients: this.clients.length,
      users: this.users.length,
      categories: this.categories.length
    };
  }
}

// Singleton para manter estado entre requests
export const storage = new InMemoryStorage();
