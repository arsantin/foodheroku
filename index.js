const express = require('express')
const app = express()
const port = process.env.PORT || 3000

//requisita o mongodb
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

const ObjectID = mongodb.ObjectID

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))

//cria a variável database, que eh igual a db
let database

//tipo de template - ejs
app.set('view engine', 'ejs')

//Define a pasta pública para ser servida pelo Express
app.use(express.static('public'))

//Faz o request na página inicial
app.get('/', (req, res) => res.render('index'))
app.get('/food-trucks', async(req, res) => {
    const foodtrucks = await find(database, 'foodtrucks', {})
    res.render('foodtrucks', { foodtrucks })
})
app.get('/food-trucks/novo', (req, res) => {
    res.render('foodtrucks_novo')
})
app.post('/food-trucks/novo', async(req, res) => {
    const foodtruck = {
        nome: req.body.nome,
        descricao: req.body.descricao,
        loc: {
            type: 'Point',
            coordinates: [ parseFloat(req.body.lng), parseFloat(req.body.lat)]
        }
    }
    await insert(database, 'foodtrucks', foodtruck)
    res.redirect('/food-trucks')
})

app.get('/food-trucks/delete/:id', async(req, res) => {    
    await deleteOne(database, 'foodtrucks', {
        _id: ObjectID(req.params.id)
    })
    res.redirect('/food-trucks')
})

app.put('/food-trucks/editar/:id', async(req, res) => {    
    await editOne(database, 'foodtrucks', {
        _id: ObjectID(req.params.id)
    })
    res.redirect('/food-trucks')
})


//faz a conexao com o mongodb
MongoClient.connect('mongodb://localhost:27017/foodtruckcwb', (err,db) => {
    if(err){
        console.log("erro ao conectar ao banco de dados")
    }else{
    database = db
    //se o mongo estiver rodando, inicie a configuração do servidor
    app.listen(port, function(){
    return console.log('food truck server rodando')
    })
}
})

//faz inserção no bd
const insert = (db, collectionName, doc) => {
    return new Promise((resolve, reject) => {
        const collection = db.collection(collectionName)
        collection.insert(doc, (err, result) => {
            if(err){
                reject(err)
                }else{
                resolve(result)
            }
        })
    })
  }

//deleta do bd
const deleteOne = (db, collectionName, filter) => {
    return new Promise((resolve, reject) => {
        const collection = db.collection(collectionName)
        collection.deleteOne(filter, (err, results) => {
            if(err){
                reject(err)
                }else{
                resolve(results)
            }
        })
    })
} 

//edita do bd
const editOne = (db, collectionName, filter) => {
    return new Promise((resolve, reject) => {
        const collection = db.collection(collectionName)
        collection.editOne(filter, (err, results) => {
            if(err){
                reject(err)
                }else{
                resolve(results)
            }
        })
    })
} 
  
//faz consulta no bd
const find = (db, collectionName, filter) => {
    return new Promise((resolve, reject) => {
        const collection = db.collection(collectionName)
        const cursor = collection.find(filter)
        const results = []
        cursor.forEach(doc => results.push(doc),
            err =>{
            if(err){
                reject(err)
            }else{
                resolve(results)
            }
        })
    })
}
  