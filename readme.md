# ethlog_example

* Fetch logs from Ethereum-like network such as: Etherenum, Binance Smart
  Chain.
* Fetching is sequence, from a block number to the present and keep getting
  logs from new blocks. It continues running from latest block after shutdown
  or restarting.
* Do simple data processing and save it to database.
* Provide a HTTP API for retrieving data.
* Support two layers of Ethereum endpoints: main and backup.
* Support load balancing and health checking between endpoints in a layer.
* See [Documents](./doc/readme.md) for more details.

# Warning and Notes

* Do not run more than an instance. Since this is all-in-one service, multi
  instances mean multi workers, it stresses Ethereum endpoints and causes
  incorrect data too. In production, consider to separate API and worker
  service.
* Etherenum RPC is bad in term of data accuracy and consistency. Unfortunately,
  there is no guarantee to avoid it, although there are many efforts is apply
  to reduce it.
* Use dedicated Etherenum endpoint for critial applications. For example: NFT
  statistic. Dedicate Ethereum endpoint mean requests to RPC go to Ethereum
  node directly, without middleware routing.
