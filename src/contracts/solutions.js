import { default as algorithmic_stock_trader_i } from "contracts/algorithmic_stock_trader_i";
import { default as algorithmic_stock_trader_iii } from "contracts/algorithmic_stock_trader_iii";

import { default as compression_i } from "contracts/compression_i";

import { default as encryption_i } from "contracts/encryption_i";
import { default as encryption_ii } from "contracts/encryption_ii";

import { default as largest_prime_factor } from "contracts/largest_prime_factor";

import { default as unique_paths_i } from "contracts/unique_paths_i";

/**
 * A hash containing type names to the solving functions.
 * 
 * Each function takes exactly 1 argument: the input data.
 */
export const SOLVERS = {
	"Algorithmic Stock Trader I": algorithmic_stock_trader_i,
	"Algorithmic Stock Trader III": algorithmic_stock_trader_iii,
	"Compression I: RLE Compression": compression_i,
	"Encryption I: Caesar Cipher": encryption_i,
	"Encryption II: Vigenère Cipher": encryption_ii,
	"Find Largest Prime Factor": largest_prime_factor,
	"Unique Paths in a Grid I": unique_paths_i,
}
