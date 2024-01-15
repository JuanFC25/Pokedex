import axios, { AxiosInstance } from 'axios';
import { HttpAdapter } from '../interfaces/http-adapter.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private readonly axios: AxiosInstance = axios;

  async get<T>(url: string): Promise<T> {
    try {
      const resp = await this.axios.get<T>(url);
      return resp.data;
    } catch (err) {
      throw new Error('Error en axios adapter');
    }
  }
}
