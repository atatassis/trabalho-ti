const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();

const mongoURI = 'mongodb+srv://admin:032946@cluster0.oclezaj.mongodb.net/?appName=Cluster0'; 

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Conectado!'))
    .catch(err => console.log('Erro no Banco:', err));

const Post = mongoose.model('Post', new mongoose.Schema({
    titulo: String,
    conteudo: String,
    data: { type: Date, default: Date.now }
}));

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get('/', async (req, res) => {
    try {
        const postsRaw = await Post.find().lean().sort({data: 'desc'});
        const posts = postsRaw.map(post => {
            return {
                ...post,
                data: post.data.toLocaleDateString('pt-BR')
            }
        });
        res.render('home', { posts: posts });
    } catch (err) {
        res.send('Erro: ' + err);
    }
});

app.get('/cadastro', (req, res) => {
    res.render('formulario');
});

app.post('/add', async (req, res) => {
    try {
        await new Post({
            titulo: req.body.titulo,
            conteudo: req.body.conteudo
        }).save();
        res.redirect('/');
    } catch (err) {
        res.send('Erro ao salvar: ' + err);
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando!');
});
