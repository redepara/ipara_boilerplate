//
//  api.js
//  ipara_boilerplate
//
//  Created by Pedro Oscar Nascimento on 2013-01-11.
//  Copyright 2013 iPará Classificados. All rights reserved.
//
( function() {
		var method;
		var noop = function noop() {
		};
		var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
		var length = methods.length;
		var console = (window.console = window.console || {});

		while (length--) {
			method = methods[length];

			// Only stub undefined methods.
			if (!console[method]) {
				console[method] = noop;
			}
		}

		//Configuração do sidebar da documentação
		var $window = $(window);
		// side bar
		$('.bs-docs-sidenav').affix({
			offset : {
				top : function() {
					return $window.width() <= 980 ? 290 : 210
				},
				bottom : 270
			}
		});

		//Carrega os templates e adiciona o body
		$.get('tmpl/_ipara.tmpl.htm', function(templates) {
			$('body').append(templates);
		});

		//Inicializa as variáveis de filtro no sessionStorage
		//A chamada do serviço de filtro é a seguinte
		//GET, OPTIONS /imoveis/faixa/pagesize/{Page}/{PageSize}/{id_subcategoria}/{id_marca}/{id_finalidade}/
		//... {id_localidade}/{id_bairro}/{dormitorios}/{vagas}/{faixa}/{UserId}
		if ( typeof sessionStorage["manterFiltro"] === "undefined" || sessionStorage["manterFiltro"] === "false") {
			sessionStorage["subcategoria"] = 0;
			sessionStorage["marca"] = 0;
			sessionStorage["finalidade"] = 0;
			sessionStorage["localidade"] = 0;
			sessionStorage["dormitorios"] = "_";
			sessionStorage["vagas"] = "_";
			sessionStorage["faixa"] = -1;
			sessionStorage["bairro"] = 0;
		}
	
	}());

// definindo o namespace ipara (para separação de escopo)
var ipara = {};
(function() {

	//Pega o userid a partir do username
	ipara.getUserId = function() {
		return $.ajax({
			url : "http://www.ipara.com.br/iParaServices/usuario/" + conf.usuario + "?format=json",
			crossDomain : true,
			async : false,
			dataType : 'jsonp'
		});
	};

	//Pega o total de anúncios do usuário
	ipara.getTotalAnuncios = function(userid) {
		return $.ajax({
			url : "http://www.ipara.com.br/iparaServices/imoveis/contafaixa/" + sessionStorage['subcategoria'] + "/0/" + sessionStorage['finalidade'] + "/" + sessionStorage['localidade'] + "/" + sessionStorage['bairro'] + "/_/_/" + sessionStorage['faixa'] + "/" + userid + "/0?format=json",
			crossDomain : true,
			async : false,
			dataType : 'jsonp'
		});
	};

	//Pega os anúncios em destaque
	ipara.carregaDestaques = function() {
		var userid = ipara.getUserId();
		userid.success(function(data) {
			$.ajax({
				url : "http://www.ipara.com.br/iparaServices/imoveis/destaques/" + conf.qtdeDestaques + "/" + data.UserId + "?format=json",
				crossDomain : true,
				async : false,
				dataType : 'jsonp',
				success : function(destaques) {
					var inner = '<div class="carousel-inner"></div><a class="left carousel-control" href="#iparaCarousel" data-slide="prev">&laquo;</a><a class="right carousel-control" href="#iparaCarousel" data-slide="next">&raquo;</a>';
					$('#iparaCarousel').html(inner);
					//Carregando itens do carousel de acordo com o template
					for (var i = 0, j = destaques.length; i < j; i++) {
						var html = destaques[i].descricao;
						var div = document.createElement("div");
						div.innerHTML = html;
						var texto = div.textContent || div.innerText || "";
						destaques[i].descricao = texto;
						$('#destaquesCarouselItemTmpl').tmpl(destaques[i]).appendTo("#iparaCarousel .carousel-inner");
					}
					$("#iparaCarousel .carousel-inner .item:first").addClass("active");
				}
			});
		});
	};
	
	//Pega outros anúncios (com destaque menor)
	ipara.carregaRecentes = function() {
		var userid = ipara.getUserId();
		userid.success(function(data) {
			$.ajax({
				url : "http://www.ipara.com.br/iparaServices/imoveis/page/pagesize/1/" + conf.qtdeOfertasRecentes + "/" + data.UserId + "?format=json",
				crossDomain : true,
				async : false,
				dataType : 'jsonp',
				success : function(recentes) {
					//Carregando itens de ofertas recentes
					for (var i = 0, j = recentes.length; i < j; i++) {
						if(i === conf.qtdeOfertasRecentes/2){
							$(".recentes").parent().append('<ul class="thumbnails recentes"></ul>');
							$('#recentesItemTmpl').tmpl(recentes[i]).appendTo(".recentes:last");
						}
						else if(i+1 > conf.qtdeOfertasRecentes/2){
							$('#recentesItemTmpl').tmpl(recentes[i]).appendTo(".recentes:last");
						}
						else
							$('#recentesItemTmpl').tmpl(recentes[i]).appendTo(".recentes");
					}
				}
			});
		});
	};

	//Carrega lista de anúncios de acordo com a página
	ipara.carregaListar = function() {
		//Limpa div da listagem caso tenha algo e carrega tmpl base
		var html = '<h3></h3><hr/><div class="pagination"><ul class="paginator"></ul></div><div class="row"></div><div class="pagination"><ul class="paginator"></ul></div>';
		$(".iparaListar").html('').append(html);

		var userid = ipara.getUserId();
		userid.success(function(data) {
			var totalAnuncios = ipara.getTotalAnuncios(data.UserId);
			totalAnuncios.success(function(total) {
				//Informar o usuário quantas ofertas encontradas
				$(".iparaListar h3").html(total + " ofertas encontradas");

				//Paginação de anúncios
				$(".paginator").paging(total, {// pagina pelo total de veiculos
					format : '[< ncnnn! >]', // define navegação
					perpage : conf.anunciosPorPagina, // elementos por página
					lapping : 0,
					fill : "...",
					page : 1, // página inicial
					onSelect : function(page) {
						var pagina = (this.slice[0] / conf.anunciosPorPagina) + 1;
						$.ajax({
							url : "http://www.ipara.com.br/iparaServices/imoveis/faixa/pagesize/" + pagina + "/" + conf.anunciosPorPagina + "/" + sessionStorage['subcategoria'] + "/0/" + sessionStorage['finalidade'] + "/" + sessionStorage['localidade'] + "/" + sessionStorage['bairro'] + "/_/_/" + sessionStorage['faixa'] + "/" + data.UserId + "?format=json",
							crossDomain : true,
							async : false,
							dataType : 'jsonp',
							beforeSend : function() {
								//Limpar lista atual de itens
								$(".iparaListar .row").html("");
							},
							success : function(anuncios) {
								//Carregando itens do listar de acordo com o template
								for (var i = 0, j = anuncios.length; i < j; i++) {
									var html = anuncios[i].descricao;
									var div = document.createElement("div");
									div.innerHTML = html;
									var texto = div.textContent || div.innerText || "";
									anuncios[i].descricao = texto;
									$('#listarItemTmpl').tmpl(anuncios[i]).appendTo(".iparaListar .row");
								}
							},
							complete : function() {
								sessionStorage["manterFiltro"] = false;
							}
						});
					},
					onFormat : formatPagination
				});

			});
		});

	};

	//Carrega filtros
	ipara.carregaFiltros = function() {
		//Limpa div de filtro caso tenha algo e carrega tmpl base
		var html = '<div class="btn-toolbar"></div>';
		$(".filtroListar").append(html);

		var userid = ipara.getUserId();
		userid.success(function(data) {

			//Adiciona comportamento ao selecionar uma opção de fitro
			$("ul.dropdown-menu li a").live("click", function() {
				sessionStorage["manterFiltro"] = true;
				$(this).parent().parent().parent().find("button span.drop-label").html($(this).html());
				sessionStorage[$(this).data("group").toString()] = $(this).data("id");
				if ($(this).data("group") === "localidade") {
					var id = $(this).data("id");
					//Filtro de bairro
					$.ajax({
						url : "http://www.ipara.com.br/iparaservices/imoveisfiltro/0/0/0/" + id + "/0/_/_/bairro/" + data.UserId + "?format=json",
						crossDomain : true,
						async : false,
						dataType : 'jsonp',
						beforeSend : function() {
							//Limpa o dropdown
							$(".filtroListar .btn-toolbar #dropBairro ul").html("");
						},
						success : function(filtros) {
							for (var i = 0, j = filtros.length; i < j; i++) {
								filtros[i].id = filtros[i].id_bairro;
								filtros[i].label = filtros[i].bairro;
								$('#dropdownItemTmpl').tmpl(filtros[i]).appendTo(".filtroListar .btn-toolbar #dropBairro ul");
							}
						}
					});
				}
			});

			//Filtro de subcategoria
			$.ajax({
				url : "http://www.ipara.com.br/iparaservices/imoveisfiltro/0/0/0/0/0/_/_/subcategoria/" + data.UserId + "?format=json",
				crossDomain : true,
				async : false,
				dataType : 'jsonp',
				beforeSend : function() {
					//Carrega o html base do dropdown
					$("#dropdownBaseTmpl").tmpl({
						label : "Tipo",
						id : "dropSubcategoria"
					}).appendTo(".filtroListar .btn-toolbar");
				},
				success : function(filtros) {
					for (var i = 0, j = filtros.length; i < j; i++) {
						filtros[i].id = filtros[i].id_subcategoria;
						filtros[i].label = filtros[i].subcategoria;
						$('#dropdownItemTmpl').tmpl(filtros[i]).appendTo(".filtroListar .btn-toolbar #dropSubcategoria ul");
					}
				}
			});

			//Filtro de finalidade
			$.ajax({
				url : "http://www.ipara.com.br/iparaservices/imoveisfiltro/0/0/0/0/0/_/_/finalidade/" + data.UserId + "?format=json",
				crossDomain : true,
				async : false,
				dataType : 'jsonp',
				beforeSend : function() {
					//Carrega o html base do dropdown
					$("#dropdownBaseTmpl").tmpl({
						label : "Finalidade",
						id : "dropFinalidade"
					}).appendTo(".filtroListar .btn-toolbar");
				},
				success : function(filtros) {
					for (var i = 0, j = filtros.length; i < j; i++) {
						filtros[i].id = filtros[i].id_finalidade;
						filtros[i].label = filtros[i].finalidade;
						$('#dropdownItemTmpl').tmpl(filtros[i]).appendTo(".filtroListar .btn-toolbar #dropFinalidade ul");
					}
				}
			});

			//Filtro de faixa de preço
			var faixas = [{
				id : "faixa1",
				group : "preco",
				label : "menos de 50 mil"
			}, {
				id : "faixa1",
				group : "preco",
				label : "50 a 100 mil"
			}, {
				id : "faixa1",
				group : "preco",
				label : "100 a 250 mil"
			}, {
				id : "faixa1",
				group : "preco",
				label : "250 a 400 mil"
			}, {
				id : "faixa1",
				group : "preco",
				label : "400 a 800 mil"
			}, {
				id : "faixa1",
				group : "preco",
				label : "acima de 800 mil"
			}];
			$(".filtroListar .btn-toolbar").append($("#dropdownBaseTmpl").tmpl({
				label : "Faixa de Preço",
				id : "dropPreco"
			}));
			for (var i = 0, j = faixas.length; i < j; i++) {
				$(".filtroListar .btn-toolbar #dropPreco ul").append($('#dropdownItemTmpl').tmpl(faixas[i]));
			}

			//Filtro de Localidade
			$.ajax({
				url : "http://www.ipara.com.br/iparaservices/imoveisfiltro/0/0/0/0/0/_/_/localidade/" + data.UserId + "?format=json",
				crossDomain : true,
				async : false,
				dataType : 'jsonp',
				beforeSend : function() {
					//Carrega o html base do dropdown
					$("#dropdownBaseTmpl").tmpl({
						label : "Cidade",
						id : "dropLocalidade"
					}).appendTo(".filtroListar .btn-toolbar");
				},
				success : function(filtros) {
					for (var i = 0, j = filtros.length; i < j; i++) {
						filtros[i].id = filtros[i].id_localidade;
						filtros[i].label = filtros[i].localidade;
						$('#dropdownItemTmpl').tmpl(filtros[i]).appendTo(".filtroListar .btn-toolbar #dropLocalidade ul");
					}
				}
			});

			//Base do filtro de bairro
			$("#dropdownBaseTmpl").tmpl({
				label : "Bairro",
				id : "dropBairro"
			}).appendTo(".filtroListar .btn-toolbar");

			//Botão de filtrar
			$('<div class="btn-group"><button type="button" class="btn btn-primary btn-large btnFiltrar">Filtrar</button></div>').appendTo(".filtroListar .btn-toolbar");
			$(".btnFiltrar").live("click", function() {
				if ($(this).parent().parent().parent().hasClass("post")) {
					location.href = "listar.html";
				}
				ipara.carregaListar();
			});
		});
	};

	//Detalhes de um anúncio
	ipara.carregaDetalhes = function(idAnuncio) {
		$.ajax({
			url : "http://www.ipara.com.br/iparaServices/imovelanuncio/" + idAnuncio + "?format=json",
			crossDomain : true,
			async : false,
			dataType : 'jsonp',
			success : function(anuncio) {
				if($(".iparaDetalhes .fotosAnuncio").length > 0){
					
					//Click nas fotos do slider abre a galeria
					$(".fotosAnuncio img").live("click",function(){
						$("#galeriaDeFotos a:first").click();
					});
					
					$.ajax({
						url : "http://www.ipara.com.br/iParaServices/fotos/anuncio/"+idAnuncio+"?format=json",
						crossDomain : true,
						async : false,
						dataType : 'jsonp',
						beforeSend:function(){
							var inner = '<div class="carousel-inner"></div><a class="left carousel-control" href="#fotosAnuncio" data-slide="prev">&laquo;</a><a class="right carousel-control" href="#fotosAnuncio" data-slide="next">&raquo;</a>';
							$('.iparaDetalhes .fotosAnuncio').css("width",$(".iparaDetalhes .fotosAnuncio").data("maxwidth")+"px").html(inner);
							
						},
						success : function(fotos) {
							var div = document.createElement("div");
							div.setAttribute("id","galeriaDeFotos");
							$("body").append(div);
							for (var i = 0, j = fotos.length; i < j; i++) {
								fotos[i].UserId = anuncio.UserId;
								fotos[i].maxWidth = $(".iparaDetalhes .fotosAnuncio").data("maxwidth");
								fotos[i].maxHeight = $(".iparaDetalhes .fotosAnuncio").data("maxheight");
								$('#sliderFotosTmpl').tmpl(fotos[i]).appendTo(".iparaDetalhes .fotosAnuncio .carousel-inner");
								$('#galeriaFotosItemTmpl').tmpl(fotos[i]).appendTo("#galeriaDeFotos");
							}
							$(".iparaDetalhes .fotosAnuncio .carousel-inner .item:first").addClass("active");
						}
					});
				}
				
				//Carrega contatos
				if($(".iparaDetalhes .contatos").length > 0){
					$(".iparaDetalhes .contatos").html($('#contatosTmpl').tmpl({titulo:"Plantão de Vendas", fone:conf.fonePrincipal, twitter:conf.twitter, facebook:conf.facebook, email:conf.email}));
				}
				
				//Renderiza informações do anúncio
				if($(".iparaDetalhes .infoAnuncio").length > 0){
					$('#infoAnuncioTmpl').tmpl(anuncio).appendTo(".iparaDetalhes .infoAnuncio");
				}
				
				//Pega o endereço e carrega o mapa
				if($("#mapa").length > 0){
					$.ajax({
	                    url: "http://www.ipara.com.br/iParaServices/endereco/" + anuncio.id_endereco + "?format=json",
	                    crossDomain: true,
	                    cache: true,
	                    dataType: 'jsonp',
	                    success: function (endereco) {
	                       
	                        //carrga o mapa
	                        $("#mapa span").goMap({
	                            maptype: 'ROADMAP',
	                            zoom: 15,
	                            markers: [{
	                                latitude: endereco.latitude,
	                                longitude: endereco.longitude,
	                                id: 'marcador',
	                                draggable: false,
	                                html: {
	                                    content: anuncio.titulo + '<br/>' + endereco.logradouro + ", " + endereco.numero + "<br/>" + endereco.bairro + " - " + endereco.local,
	                                    popup: true
	                                }
	                            }],
	                            disableDoubleClickZoom: true
	                        });
	                        
	                    }
	                });
               }
				
			}
		});
	};

})();

//Funções auxiliares------------------------------

//Função de formatação do paginador
function formatPagination(type) {
	switch (type) {
		case 'block':
			// n and c
			if (this.value == this.page)
				return '<li class="active"><a href="#listar">' + this.value + '</a></li>';
			if (!this.active)
				return '';
			return '<li class="disable"><a href="#listar">' + this.value + '</a></li>';
		case 'next':
			// >
			if (this.active)
				return '<li class="disable"><a href="#listar">Próximo</a></li>';
			return '<li class="active"><a href="#listar">Próximo</a></li>';
		case 'prev':
			// <
			if (this.active)
				return '<li class="disable"><a href="#listar">Anterior</a></li>';
			return '<li class="active"><a href="#listar">Anterior</a></li>';
		case 'first':
			// [
			if (this.active)
				return '<li class="disable"><a href="#listar">Primeiro</a></li>';
			return '<li class="active"><a href="#listar">Primeiro</a></li>';
		case 'last':
			// ]
			if (this.active)
				return '<li class="disable"><a href="#listar">Último</a></li>';
			return '<li class="active"><a href="#listar">Último</a></li>';
	}
}

//Função para pegar objeto querystring da url
function getQueryString() {
	var result = {}, queryString = location.search.substring(1), re = /([^&=]+)=([^&]*)/g, m;

	while ( m = re.exec(queryString)) {
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}

	return result;
}

