/**
 * Deletes keys with undefined values from a JSON.
 * @param {*} json_data JSON object.
 * @param {*} fields_to_filter String array containing fields to check if undefined.
 * @returns Filtered JSON query object.
 */
function filter_empty_fields(json_data, fields_to_filter) {
    return fields_to_filter.reduce((filter, field) => {
        if (json_data[field] !== undefined)
            return {
                [field]: json_data[field],
                ...filter,
            };

        return filter;
    }, {});
}

/**
 * 
 * @param {JSON} json_data data to be filtered (single document). In practice, it should be a schema_class object, such as a Flight or Airport.
 * @param {mongoose.Schema} schema_class mongoose schema class, like Airport of Flight.
 */
function filter_schema_fields(json_data, schema_class){
    // Schema fields
    const schema_keys = Object.keys(schema_class.schema.paths);
    
    // Deletes "undefined" values
    let filtered_data = schema_keys.reduce((filter, field) => {
        if (json_data[field] !== undefined)
            return {
                [field]: json_data[field],
                ...filter,
            };

        return filter;
    }, {});

    // Deletes additional, non-class, keys (attributes)
    Object.keys(filtered_data).forEach(function(key){
        // If key isn't part of schema_class' attributes
        if (!schema_keys.includes(key)) {
          delete filtered_data[key];
        }
      });

    return filtered_data;
}

module.exports = {
    filter_empty_fields,
    filter_schema_fields
}