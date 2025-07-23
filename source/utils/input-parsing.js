function parse_input_json(input_data){
    let input_parsed = {};
    
    try {
        if (typeof input_data.inputs === 'string') {
            input_parsed = JSON.parse(input_data.inputs);
        } else if (typeof input_data.inputs === 'object') {
            input_parsed = input_data.inputs;
        } else {
            input_parsed = input_data;
        }
    } catch (e) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: { error: 'Invalid JSON in inputs field' },
        };
    }

    return input_parsed;
}

module.exports = {
    parse_input_json
}