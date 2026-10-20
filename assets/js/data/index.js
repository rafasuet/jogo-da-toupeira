/**
 * Ponto único de escolha da implementação de persistência.
 * Parcial 2 → LocalMatchRepository | Parcial 3 → ApiMatchRepository
 */
import { LocalMatchRepository } from './LocalMatchRepository.js';

export const matchRepository = new LocalMatchRepository();
