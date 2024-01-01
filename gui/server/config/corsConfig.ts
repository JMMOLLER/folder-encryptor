import cors from 'cors'

const corsConf = cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
})

export default corsConf
