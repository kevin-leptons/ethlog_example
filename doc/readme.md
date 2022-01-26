# Documents

* [Entry](#entry)
* [Configuration](#configuration)
* [API References](#api-references)
* [Development](#development)

# Entry

```bash
# Run both HTTP API and worker.
npm start [-- CONFIG_FILE]

# Start only fetching data.
npm run worker [-- CONFIG_FILE]

# Start only serving HTTP API.
npm run api [-- CONFIG_FILE]
```

# Configuration

See [sample_config.json](./sample_config.json) for more details.

# API References

See Open API specifications at root of endpoint.

# Development

```bash
# Install dependency packages.
npm install

# Check coding standard.
npm run standardize

# Run tests.
npm test

# Copy sample configuration and update it properly.
cp doc/sample_config.json config.json
chmod 600 config.json

# Start services.
npm start
```
