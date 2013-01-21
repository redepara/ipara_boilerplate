iPará Html5 Boilerplate
=

Introdução
-
Este projeto é um site base para criação de [Sites Conectados] (http://www.sitesconectados.com.br/)

Branches
-
Utilize o branch master para Sites Conectados de imóveis. Caso contrário utilizes o branch apropriado.

Configurações
-
Na pasta `js` utilize o arquivo o `config.js` para configurar o Site Conectado do cliente.
As configurações básicas são:
- usuario : "login_do_usuario",
- qtdeDestaques : 7,
- qtdeOfertasRecentes:12,
- anunciosPorPagina : 5,
- email:"email@dousuario.com",
- twitter:"@twitter_do_usuario",
- facebook:"facebook.do.usuario",
- fonePrincipal:"(91) 3083 7678",
- googleAnalytics:"UA-XXXXX-X"

Preenchidas essas informações o site já estará funcionando com os anúncios cadastrados na ferramenta PINGO.

Customização
-
O site base utiliza o Bootstrap como estilo básico e algumas adições feitas no main.css. 
Para customizar basta adicionar a folha de estilo que desejar e adicionar ao seu projeto. Todos os componentes são baseados em HTML5, portanto todos são customizáveis de acordo com a necessidade.

Componentes
-
Todos os componentes são dependentes dos scripts:
				`{modernizr:"js/vendor/modernizr-2.6.2-respond-1.1.0.min.js?v=1.0"},`
				`{widgets:"js/vendor/widgets.js?v=1.0"},`
				`{jqueryTmpl:"js/vendor/jquery.tmpl.min.js?v=1.0"},`
				`{jqueryPaging:"js/vendor/jquery.paging.min.js?v=1.0"},`
				`{bootstrap:"js/vendor/bootstrap.min.js?v=1.0"},`
				`{prettify:"js/vendor/prettify.js?v=1.0"},`
				`{sessionStorage:"js/vendor/sessionstorage.1.4.js?v=1.0"},`
				`{configuracao:"js/config.js?v=1.0"},`
				`{api:"js/api.min.js?v=1.0"}`
				
Anúncios em Destaques
-
Basta inserir na página o seguinte código html: `<div id="iparaCarousel"></div>`
Anúncios Recentes
-
HTML: `<ul class="recentes"></ul>`

Filtro p/ abrir a página listar.html
-
HTML:`<div title="filtro" class="filtroListar post"></div>`

Filtro p/ listar na mesma página
-
O html a seguir pode ser encontrado na página listar.html:
`<div title="filtro" class="filtroListar"></div>`
`<div title="listar" class="iparaListar"></div>`

Detalhamento de imóveis
=

Para carregar as fotos
-
`<div data-maxwidth="370" data-maxheight="370" id="fotosAnuncio" class="fotosAnuncio"></div>`
`data-maxwidth` e `data-maxheight` são utilizado para setar a largura e altura máxima permitida das fotos.
Para carregar os contatos
-
`<div class="contatos"></div>`
Para carregar as informações do imóvel utilize o seguinte html
-
`<div class="infoAnuncio"></div>`
