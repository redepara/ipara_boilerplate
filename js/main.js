//Carregar Carousel se houver
if ($("#iparaCarousel").length > 0) {
	ipara.carregaDestaques();
}

//Carregar o componente de listar se houver
if ($(".iparaListar").length > 0) {
	ipara.carregaListar();
}

//Carrega o componente de filtro se houver
if($(".filtroListar").length > 0){
	ipara.carregaFiltros();
}

//Carregar os componentes de detalhes
if ($(".iparaDetalhes").length > 0) {
	var idAnuncio = getQueryString()["id"];
	ipara.carregaDetalhes(idAnuncio);
	
}

//Chamadas de funções que deverão ser executadas apenas quando tudo for carregado
$(window).load(function() {
	//Carrega galeria prettyphoto se houver galeria na pagina
	if($("a[rel^='prettyPhoto']").length > 0)
		$("a[rel^='prettyPhoto']").prettyPhoto();
	
	//Carrega widgets do twitter se houver
	twttr.widgets.load();
});
