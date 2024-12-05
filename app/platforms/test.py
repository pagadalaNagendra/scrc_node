import time
# import csv

# def process_node_ids(node_ids):
#     if isinstance(node_ids, str):
#         if ',' in node_ids:
#             return ''.join(node_ids.split(',')).replace('{', '').replace('}', '').split(',')
#         return node_ids
#     elif isinstance(node_ids, list):
#         return ','.join(node_ids)
#     return node_ids

# def read_and_process_csv(input_file, output_file):
#     with open(input_file, mode='r', newline='') as infile:
#         reader = csv.DictReader(infile)
#         fieldnames = reader.fieldnames
#         rows = list(reader)

#     for row in rows:
#         if 'node_ids' in row:
#             row['node_ids'] = process_node_ids(row['node_ids'])

#     with open(output_file, mode='w', newline='') as outfile:
#         writer = csv.DictWriter(outfile, fieldnames=fieldnames)
#         writer.writeheader()
#         writer.writerows(rows)

# input_file = 'app/platforms/simulations.csv'  # Replace with your input file path
# output_file = 'output.csv'  # Replace with your output file path

# read_and_process_csv(input_file, output_file)

print(time.time())