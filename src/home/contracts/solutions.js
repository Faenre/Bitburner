import { default as algorithmic_stock_trader_i } from "./algorithmic_stock_trader_i";
import { default as algorithmic_stock_trader_ii } from "./algorithmic_stock_trader_ii";
import { default as algorithmic_stock_trader_iii } from "./algorithmic_stock_trader_iii";
import { default as algorithmic_stock_trader_iv } from "./algorithmic_stock_trader_iv";

import { default as compression_i } from "./compression_i";
import { default as compression_ii } from "./compression_ii";

import { default as encryption_i } from "./encryption_i";
import { default as encryption_ii } from "./encryption_ii";

import { default as unique_paths_i } from "./unique_paths_i";
import { default as unique_paths_ii } from "./unique_paths_ii";

import { default as array_jumping_game } from "./array_jumping_game";
import { default as generate_ip_addresses } from "./generate_ip_addresses";
import { default as largest_prime_factor } from "./largest_prime_factor";
import { default as merge_overlapping_intervals } from "./merge_overlapping_intervals";
import { default as proper_2_coloring_of_graph } from "./proper_2_coloring_of_graph";
import { default as shortest_path_in_grid } from "./shortest_path_in_grid";

/**
 * A hash containing type names to the solving functions.
 *
 * Each function takes exactly 1 argument: the input data.
 */
export const SOLVERS = {
	"Algorithmic Stock Trader I": algorithmic_stock_trader_i,
	"Algorithmic Stock Trader II": algorithmic_stock_trader_ii,
	"Algorithmic Stock Trader III": algorithmic_stock_trader_iii,
	"Algorithmic Stock Trader IV": algorithmic_stock_trader_iv,
	"Compression I: RLE Compression": compression_i,
	"Compression II: LZ Decompression": compression_ii,
	"Encryption I: Caesar Cipher": encryption_i,
	"Encryption II: Vigenère Cipher": encryption_ii,
	"Array Jumping Game": array_jumping_game,
	"Generate IP Addresses": generate_ip_addresses,
	"Find Largest Prime Factor": largest_prime_factor,
	"Merge Overlapping Intervals": merge_overlapping_intervals,
	"Proper 2-Coloring of a Graph": proper_2_coloring_of_graph,
	"Shortest Path in a Grid": shortest_path_in_grid,
	"Unique Paths in a Grid I": unique_paths_i,
	"Unique Paths in a Grid II": unique_paths_ii,
}
