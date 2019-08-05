const express = require('express')
const fetch = require('node-fetch')
const ScriptReader = require('script_reader')

const app = express()

function log (msg) {
  console.log(new Date().toISOString().replace('T', ' '), msg)
}

async function getOPReturnData (txhash) {
  const url = `https://api.whatsonchain.com/v1/bsv/main/tx/hash/${txhash}`
  const response = await fetch(url)
  const json = await response.json()

  const txOuts = json.vout.map(out => Buffer.from(out.scriptPubKey.hex, 'hex'))

  const opReturns = txOuts.filter(out => out[0] === 0x6a || (out[0] === 0x00 && out[1] === 0x6a))

  if (opReturns.length === 0) {
    throw new Error('no op_return transaction outputs')
  }

  const firstOpReturn = opReturns[0]

  const reader = ScriptReader(firstOpReturn)
  return reader.decodeParts()
}

app.get('/api/:tx', async (req, res) => {
  try {
    const oprParts = await getOPReturnData(req.params.tx)

    // If this is the new OP_FALSE OP_RETURN format, remove the prepending OP_FALSE
    if (oprParts[0] === 0x00 && oprParts[1] === 0x6a) {
      oprParts.shift()
    }

    switch (oprParts[1].toString()) {
      case 'meta':
        // Metanet protocol
        res.status(200)

        if (oprParts[4].toString() === '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut') {
          res.contentType(oprParts[6].toString())
          res.send(oprParts[5])
        } else {
          res.contentType('text/plain')
          res.send(oprParts[4])
        }
        break

      case '1ChDHzdd1H4wSjgGMHyndZm6qxEDGjqpJL':
        // BCAT part
        res.status(200)
        res.contentType('text/plain')
        res.send('This is a bcat part. Please find a parent transaction to display')
        break

      case '15DHFxWZJT58f9nhyGnsRBqrgwK4W6h4Up':
        // BCAT transaction
        let d = Buffer.alloc(0)
        for (let i = 7; i < oprParts.length; i++) {
          const txhash = oprParts[i].toString('hex')

          const parts = await getOPReturnData(txhash)

          d = Buffer.concat([d, parts[2]])
        }

        res.status(200)
        res.setHeader('Content-Transfer-Encoding', 'binary')
        res.contentType(oprParts[3].toString())

        res.send(d)
        break

      case '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut':
        // B protocol
        res.status(200)
        res.contentType(oprParts[3].toString())
        res.send(oprParts[2])
        break

      default:
        throw new Error('Unrecognized op_return transaction')
    }
  } catch (err) {
    log(err)
    res.status(400).send({ error: 'Something failed!' })
  }
})

const port = 4000

app.listen(port, () =>
  log(`Example app listening on port ${port}`)
)
