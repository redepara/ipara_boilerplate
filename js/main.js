//Carregar Carousel se houver
if ($("#iparaCarousel").length > 0) {
	ipara.carregaDestaques();
}

//Carregar o componente de listar se houver
if ($(".iparaListar").length > 0) {
	ipara.carregaListar();
	ipara.carregaFiltros();
}

//Carregar os componentes de detalhes
if ($(".iparaDetalhes").length > 0) {
	ipara.carregaDetalhes();
}
