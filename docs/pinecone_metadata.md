Understanding metadata
You can attach metadata key-value pairs to vectors in an index. When you query the index, you can then filter by metadata to ensure only relevant records are scanned.

Searches with metadata filters retrieve exactly the number of nearest-neighbor results that match the filters. For most cases, the search latency will be even lower than unfiltered searches.

Searches without metadata filters do not consider metadata. To combine keywords with semantic search, see sparse-dense embeddings.

​
Supported metadata types
Metadata payloads must be key-value pairs in a JSON object. Keys must be strings, and values can be one of the following data types:

String
Number (integer or floating point, gets converted to a 64 bit floating point)
Booleans (true, false)
List of strings
Null metadata values are not supported. Instead of setting a key to hold a
null value, we recommend you remove that key from the metadata payload.

For example, the following would be valid metadata payloads:

JSON

{
"genre": "action",
"year": 2020,
"length_hrs": 1.5
}

{
"color": "blue",
"fit": "straight",
"price": 29.99,
"is_jeans": true
}
​
Supported metadata size
Pinecone supports 40KB of metadata per vector.

​
Metadata query language
Pinecone’s filtering query language is based on MongoDB’s query and projection operators. Pinecone currently supports a subset of those selectors:

Filter Description Supported types
$eq	Matches vectors with metadata values that are equal to a specified value. Example: {"genre": {"$eq": "documentary"}} Number, string, boolean
$ne	Matches vectors with metadata values that are not equal to a specified value. Example: {"genre": {"$ne": "drama"}} Number, string, boolean
$gt	Matches vectors with metadata values that are greater than a specified value. Example: {"year": {"$gt": 2019}} Number
$gte	Matches vectors with metadata values that are greater than or equal to a specified value. Example:{"year": {"$gte": 2020}} Number
$lt	Matches vectors with metadata values that are less than a specified value. Example: {"year": {"$lt": 2020}} Number
$lte	Matches vectors with metadata values that are less than or equal to a specified value. Example: {"year": {"$lte": 2020}} Number
$in	Matches vectors with metadata values that are in a specified array. Example: {"genre": {"$in": ["comedy", "documentary"]}} String, number
$nin	Matches vectors with metadata values that are not in a specified array. Example: {"genre": {"$nin": ["comedy", "documentary"]}} String, number
$exists	Matches vectors with the specified metadata field. Example: {"genre": {"$exists": true}} Boolean
$and	Joins query clauses with a logical AND. Example: {"$and": [{"genre": {"$eq": "drama"}}, {"year": {"$gte": 2020}}]} -
$or	Joins query clauses with a logical OR. Example: {"$or": [{"genre": {"$eq": "drama"}}, {"year": {"$gte": 2020}}]} -
For example, the following has a "genre" metadata field with a list of strings:

JSON

{ "genre": ["comedy", "documentary"] }
This means "genre" takes on both values, and requests with the following filters will match:

JSON

{"genre":"comedy"}

{"genre": {"$in":["documentary","action"]}}

{"$and": [{"genre": "comedy"}, {"genre":"documentary"}]}
However, requests with the following filter will not match:

JSON

{ "$and": [{ "genre": "comedy" }, { "genre": "drama" }] }
Additionally, requests with the following filters will not match because they are invalid. They will result in a compilation error:

# INVALID QUERY:

{"genre": ["comedy", "documentary"]}

# INVALID QUERY:

{"genre": {"$eq": ["comedy", "documentary"]}}
​
Manage high-cardinality in pod-based indexes
For pod-based indexes, Pinecone indexes all metadata by default. When metadata contains many unique values, pod-based indexes will consume significantly more memory, which can lead to performance issues, pod fullness, and a reduction in the number of possible vectors that fit per pod.

To avoid indexing high-cardinality metadata that is not needed for filtering, use selective metadata indexing, which lets you specify which fields need to be indexed and which do not, helping to reduce the overall cardinality of the metadata index while still ensuring that the necessary fields are able to be filtered.

Since high-cardinality metadata does not cause high memory utilization in serverless indexes, selective metadata indexing is not supported.

​
Considerations for serverless indexes
For each serverless index, Pinecone clusters records that are likely to be queried together. When you query a serverless index with a metadata filter, Pinecone first uses internal metadata statistics to exclude clusters that do not have records matching the filter and then chooses the most relevant remaining clusters.

Note the following considerations:

When filtering by numeric metadata that cannot be ordered in a meaningful way (e.g., IDs as opposed to dates or prices), the chosen clusters may not be accurate. This is because the metadata statistics for each cluster reflect the min and max metadata values in the cluster, and min and max are not helpful when there is no meaningful order.

In such cases, it is best to store the metadata as strings instead of numbers. When filtering by string metadata, the chosen clusters will be more accurate, with a low false-positive rate, because the string metadata statistics for each cluster reflect the actual string values, compressed for space-efficiency.

When you use a highly selective metadata filter (i.e., a filter that rejects the vast majority of records in the index), the chosen clusters may not contain enough matching records to satisfy the designated top_k.

For more details about query execution, see Serverless architecture.

​
Use metadata
The following operations support metadata:

Query an index with metadata filters
Insert metadata into an index
Delete vectors by metadata filter
Pinecone Assistant also supports metadata filters. For more information, see Understanding files in Pinecone Assistant.
