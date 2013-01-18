//
//  api.js
//  ipara_boilerplate
//
//  Created by Pedro Oscar Nascimento on 2013-01-11.
//  Copyright 2013 iPará Classificados. All rights reserved.
//
//Configurações e inicializações
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

		//Carrega os templates e adiciona no body
		$.get('tmpl/_ipara.tmpl.htm', function(templates) {
			$('body').append(templates);
		});

		//Inicializa as variáveis de filtro no sessionStorage
		//A chamada do serviço de filtro é a seguinte
		///{id_subcategoria}/{id_categoria_marca}/{id_modelo}/{id_localidade}/{id_bairro}/{id_vecor}/{faixa}/{UserId}
		if ( typeof sessionStorage["manterFiltro"] === "undefined" || sessionStorage["manterFiltro"] === "false") {
			sessionStorage["subcategoria"] = 0;
			sessionStorage["marca"] = 0;
			sessionStorage["modelo"] = 0;
			sessionStorage["localidade"] = 0;
			sessionStorage["bairro"] = 0;
			sessionStorage["vecor"] = 0;
			sessionStorage["faixa"] = -1;
			sessionStorage["anoIni"] = 1800;
			sessionStorage["anoFim"] = new Date().getFullYear() + 1;
		}

		//Carrega API do Facebook
		$('body').append('<div id="fb-root"></div>');
		( function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id))
					return;
				js = d.createElement(s);
				js.id = id;
				js.src = "//connect.facebook.net/pt_BR/all.js#xfbml=1&appId=248204328585913";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));

		//Carrega Google Analytics
		var _gaq = [['_setAccount', conf.googleAnalytics], ['_trackPageview']];
		( function(d, t) {
				var g = d.createElement(t), s = d.getElementsByTagName(t)[0];
				g.src = ('https:' == location.protocol ? '//ssl' : '//www') + '.google-analytics.com/ga.js';
				s.parentNode.insertBefore(g, s)
			}(document, 'script'));

		//Carrega API do Twitter
		! function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (!d.getElementById(id)) {
				js = d.createElement(s);
				js.id = id;
				js.src = "//platform.twitter.com/widgets.js";
				fjs.parentNode.insertBefore(js, fjs);
			}
		}(document, "script", "twitter-wjs");

		//Desabilitar cache de ajax
		$.ajaxSetup({
			cache : false
		});
	}());

// definindo o namespace ipara (para separação de escopo)
var ipara = {};
//Extendendo o namespace (incluindo funcionalidades)
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
			url : "http://www.ipara.com.br/iparaServices/veiculos/anomodelo/" + sessionStorage['anoIni'] + "/" + sessionStorage['anoFim'] + "/" + sessionStorage['subcategoria'] + "/" + sessionStorage['marca'] + "/" + sessionStorage['modelo'] + "/" + sessionStorage['localidade'] + "/" + sessionStorage['bairro'] + "/" + sessionStorage['vecor'] + "/" + userid + "?format=json",
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
				url : "http://www.ipara.com.br/iparaServices/veiculos/destaques/" + conf.qtdeDestaques + "/" + data.UserId + "?format=json",
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
				url : "http://www.ipara.com.br/iparaServices/veiculos/page/pagesize/1/" + conf.qtdeOfertasRecentes + "/" + data.UserId + "?format=json",
				crossDomain : true,
				async : false,
				dataType : 'jsonp',
				success : function(recentes) {
					//Carregando itens de ofertas recentes
					for (var i = 0, j = recentes.length; i < j; i++) {
						if (((conf.qtdeOfertasRecentes - i) % 6) === 0) {
							$(".recentes").parent().append('<ul class="thumbnails recentes"></ul>');
							$('#recentesItemTmpl').tmpl(recentes[i]).appendTo(".recentes:last");
						} else {
							$('#recentesItemTmpl').tmpl(recentes[i]).appendTo(".recentes:last");
						}
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
							url : "http://www.ipara.com.br/iparaServices/veiculos/anomodelo/pagesize/" + pagina + "/" + conf.anunciosPorPagina + "/" + sessionStorage['anoIni'] + "/" + sessionStorage['anoFim'] + "/" + sessionStorage['subcategoria'] + "/" + sessionStorage['marca'] + "/" + sessionStorage['modelo'] + "/" + sessionStorage['localidade'] + "/" + sessionStorage['bairro'] + "/" + sessionStorage['vecor'] + "/" + data.UserId + "?format=json",
							crossDomain : true,
							async : false,
							dataType : 'jsonp',
							cache : false,
							beforeSend : function() {
								//Limpar lista atual de itens
								$(".iparaListar .row").html("");
							},
							success : function(anuncios) {
								//Carregando itens do listar de acordo com o template
								for (var i = 0, j = anuncios.length; i < j; i++) {
									//Convertendo caracteres em html para depois remover tags
									var html = $("<span />", {
										html : anuncios[i].descricao
									}).text();
									var texto = html.replace(/(<([^>]+)>)/ig, "");
									anuncios[i].descricao = texto.substr(0, 456) + "...";
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
						url : "http://www.ipara.com.br/iparaservices/veiculosfiltro/" + sessionStorage["subcategoria"] + "/" + sessionStorage["marca"] + "/" + sessionStorage["modelo"] + "/" + sessionStorage["localidade"] + "/" + sessionStorage["bairro"] + "/" + sessionStorage["vecor"] + "/bairro/" + data.UserId + "?format=json",
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

				if ($(this).data("group") === "subcategoria") {
					//Filtro de marca
					$.ajax({
						url : "http://www.ipara.com.br/iparaservices/veiculosfiltro/" + sessionStorage['subcategoria'] + "/0/0/0/0/0/marca/" + data.UserId + "?format=json",
						crossDomain : true,
						async : false,
						dataType : 'jsonp',
						beforeSend : function() {
							//Limpa o dropdown
							$(".filtroListar .btn-toolbar #dropMarca ul").html("");
						},
						success : function(filtros) {
							for (var i = 0, j = filtros.length; i < j; i++) {
								filtros[i].id = filtros[i].id_categoria_marca;
								filtros[i].label = filtros[i].marca;
								$('#dropdownItemTmpl').tmpl(filtros[i]).appendTo(".filtroListar .btn-toolbar #dropMarca ul");
							}
						}
					});
				}

				if ($(this).data("group") === "marca") {
					//Filtro de marca
					$.ajax({
						url : "http://www.ipara.com.br/iparaservices/veiculosfiltro/" + sessionStorage['subcategoria'] + "/" + sessionStorage['marca'] + "/0/0/0/0/modelo/" + data.UserId + "?format=json",
						crossDomain : true,
						async : false,
						dataType : 'jsonp',
						beforeSend : function() {
							//Limpa o dropdown
							$(".filtroListar .btn-toolbar #dropModelo ul").html("");
						},
						success : function(filtros) {
							for (var i = 0, j = filtros.length; i < j; i++) {
								filtros[i].id = filtros[i].id_modelo;
								filtros[i].label = filtros[i].modelo;
								$('#dropdownItemTmpl').tmpl(filtros[i]).appendTo(".filtroListar .btn-toolbar #dropModelo ul");
							}
						}
					});
				}
			});

			//Filtro de subcategoria
			$.ajax({
				url : "http://www.ipara.com.br/iparaservices/veiculosfiltro/0/0/0/0/0/0/subcategoria/" + data.UserId + "?format=json",
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

			//Base do filtro de marca
			$("#dropdownBaseTmpl").tmpl({
				label : "Marca",
				id : "dropMarca"
			}).appendTo(".filtroListar .btn-toolbar");

			//Base do filtro de modelo
			$("#dropdownBaseTmpl").tmpl({
				label : "Modelo",
				id : "dropModelo"
			}).appendTo(".filtroListar .btn-toolbar");

			//Filtros de Ano
			filtroAnoInicial();
			filtroAnoFinal();

			//Filtro de Localidade
			$.ajax({
				url : "http://www.ipara.com.br/iparaservices/veiculosfiltro/" + sessionStorage["subcategoria"] + "/" + sessionStorage["marca"] + "/" + sessionStorage["modelo"] + "/" + sessionStorage["localidade"] + "/" + sessionStorage["bairro"] + "/" + sessionStorage["vecor"] + "/localidade/" + data.UserId + "?format=json",
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
			url : "http://www.ipara.com.br/iparaServices/veiculoanuncio/" + idAnuncio + "?format=json",
			crossDomain : true,
			async : false,
			dataType : 'jsonp',
			success : function(anuncio) {
				if ($(".iparaDetalhes .fotosAnuncio").length > 0) {

					//Click nas fotos do slider abre a galeria
					$(".fotosAnuncio img").live("click", function() {
						$("#galeriaDeFotos a:first").click();
					});

					//Carrega as fotos do anúncio
					$.ajax({
						url : "http://www.ipara.com.br/iParaServices/fotos/anuncio/" + idAnuncio + "?format=json",
						crossDomain : true,
						async : false,
						dataType : 'jsonp',
						beforeSend : function() {
							var inner = '<div class="carousel-inner"></div><a class="left carousel-control" href="#fotosAnuncio" data-slide="prev">&laquo;</a><a class="right carousel-control" href="#fotosAnuncio" data-slide="next">&raquo;</a>';
							$('.iparaDetalhes .fotosAnuncio').css("width", $(".iparaDetalhes .fotosAnuncio").data("maxwidth") + "px").html(inner);

						},
						success : function(fotos) {
							var div = document.createElement("div");
							div.setAttribute("id", "galeriaDeFotos");
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
				if ($(".iparaDetalhes .contatos").length > 0) {
					$(".iparaDetalhes .contatos").html($('#contatosTmpl').tmpl({
						titulo : "Plantão de Vendas",
						fone : conf.fonePrincipal,
						twitter : conf.twitter,
						facebook : conf.facebook,
						email : conf.email
					}));
				}

				//Renderiza informações do anúncio
				if ($(".iparaDetalhes .infoAnuncio").length > 0) {

					//Converte html caracteres em tags
					anuncio.descricao = $('<span />', {
						html : anuncio.descricao
					}).text();

					//Carrega os opcionais do veículo
					$.ajax({
						url : "http://www.ipara.com.br/iparaServices/veiculoanuncio/" + idAnuncio + "/true?format=json",
						crossDomain : true,
						async : false,
						dataType : 'jsonp',
						success : function(opcionais) {
							if (opcionais.length > 0) {
								anuncio.opcionais = "";
								for (var i = 0, j = opcionais.length; i < j; i++) {
									anuncio.opcionais += "<li>" + opcionais[i].item + "</li>";
								}
							} else {
								console.log("nao tem opcionais");
								anuncio.opcionais = "Não informado.";
							}
							anuncio.valor = anuncio.valor === "0,00" ? "" : "R$" + anuncio.valor;
							$('#infoAnuncioTmpl').tmpl(anuncio).appendTo(".iparaDetalhes .infoAnuncio");

							//Pega o endereço e carrega o mapa
							if ($("#mapa").length > 0) {
								$.ajax({
									url : "http://www.ipara.com.br/iParaServices/endereco/" + anuncio.id_endereco + "?format=json",
									crossDomain : true,
									cache : true,
									dataType : 'jsonp',
									success : function(endereco) {

										//carrga o mapa
										$("#mapa span").goMap({
											maptype : 'ROADMAP',
											zoom : 15,
											markers : [{
												latitude : endereco.latitude,
												longitude : endereco.longitude,
												id : 'marcador',
												draggable : false,
												html : {
													content : anuncio.titulo + '<br/>' + endereco.logradouro + ", " + endereco.numero + "<br/>" + endereco.bairro + " - " + endereco.local,
													popup : true
												}
											}],
											disableDoubleClickZoom : true
										});

									}
								});
							}
						}
					});

				}

			}
		});
	};

	ipara.carregaAgendamento = function() {
		var userid = ipara.getUserId();
		userid.success(function(user) {
			//Busca os serviços que o usuário tem acesso
			$.ajax({
				url : "http://www.ipara.com.br/iparaServices/servicos/" + user.UserId + "?format=json",
				crossDomain : true,
				async : false,
				dataType : 'jsonp',
				success : function(servicos) {
					for (var i = 0, j = servicos.length; i < j; i++) {
						if (servicos[i].id_servico === "2" && servicos[i].status === "True") {
							//Carrega imóveis para o cliente selecionar
							var totalUsuario = ipara.getTotalAnuncios(user.UserId);
							totalUsuario.success(function(total) {
								$.ajax({
									url : "http://www.ipara.com.br/iparaServices/veiculos/page/pagesize/1/" + total + "/" + user.UserId + "?format=json",
									crossDomain : true,
									async : false,
									dataType : 'jsonp',
									beforeSend : function() {
										$('#formAgendaTmpl').tmpl({}).appendTo(".agendaVisita #formAgenda");
									},
									success : function(anuncios) {
										//Plugin de data
										$('.datepicker').datepicker({
											format : 'dd/mm/yyyy'
										});
										for (var i = 0, j = anuncios.length; i < j; i++) {
											$("#id_anuncio").append('<option value="' + anuncios[i].id_anuncio + '">' + anuncios[i].titulo + ' - ' + anuncios[i].local + '/PA</option>');
										}
									},
									complete : function() {
										//Aplica o filterbytext
										$("#id_anuncio").filterByText("#inputBusca", false);
									}
								});
							});
							//Validação do formulário
							$('#formAgenda').validate({
								rules : {
									email : {
										required : true,
										email : true
									},
									nome : {
										required : true
									},
									data_in : {
										required : true
									}
								},
								messages : {
									email : {
										required : "Por favor insira seu email para entrarmos em contato.",
										email : "Insira um email válido."
									},
									nome : {
										required : "Por favor insira seu nome."
									},
									data_in : {
										required : "Escolha a data que você deseja fazer a visita."
									}
								},
								highlight : function(label) {
									$(label).closest('.control-group').addClass('error');
								},
								success : function(label) {
									label.text('OK!').addClass('valid').closest('.control-group').addClass('success');
								}
							});
							//Submit do form
							$("#formAgenda").live('submit', function() {
								$("#status").val("false");
								$("#userId").val(user.UserId);
								$("#data_fim").val($("#data_in").val());
								$("#data_update").val(dataAtual());
								$("#descricao").val($("#nome").val() + " - " + $("#email").val() + " - " + $("#telefone").val() + " [Preferência de Horário: " + $("#horario").val() + "]");
								$("#titulo").val($("#id_anuncio option:selected").html());
								var data = $('#formAgenda').serializeObject();
								$.ajax({
									url : "http://ipara.com.br/iParaServices/agendavisita?format=json",
									crossDomain : true,
									async : false,
									dataType : 'jsonp',
									data : data,
									success : function(agenda) {
										console.log(agenda === true);
										console.log(agenda);
										if (agenda === true) {
											$("#formAgenda").hide("slow");
											$("#formAgenda").parent().append("<h4>Visita agendada com sucesso. Aguarde que entraremos em contato com você.</h4>")
										}
									}
								});
								return false;
							});

						}
					}
				}
			});
		});
	};

})();

//Caso esteja na pagina agendarVisita.html
//verificar se o usuario tem acesso ao serviço
if ($(".agendaVisita").length > 0) {
	ipara.carregaAgendamento();
}

//Chamadas para as funções definidas no namespace ipara
//Carregar Carousel se houver
if ($("#iparaCarousel").length > 0) {
	ipara.carregaDestaques();
}

//Carregar o componente de listar se houver
if ($(".iparaListar").length > 0) {
	ipara.carregaListar();
}

//Carrega o componente de filtro se houver
if ($(".filtroListar").length > 0) {
	ipara.carregaFiltros();
}

//Carregar os componentes de detalhes
if ($(".iparaDetalhes").length > 0) {
	var idAnuncio = getQueryString()["id"];
	ipara.carregaDetalhes(idAnuncio);

}

//Carrega o componente de ofertas recentes se houver
if ($(".recentes").length > 0) {
	ipara.carregaRecentes();
}

//Chamadas de funções que deverão ser executadas apenas quando tudo for carregado
$(window).load(function() {
	//Carrega galeria prettyphoto se houver galeria na pagina
	if ($("a[rel^='prettyPhoto']").length > 0)
		$("a[rel^='prettyPhoto']").prettyPhoto();

	//Carrega widgets do twitter se houver
	twttr.widgets.load();

	var userid = ipara.getUserId();
	userid.success(function(user) {
		//Busca os serviços que o usuário tem acesso
		$.ajax({
			url : "http://www.ipara.com.br/iparaServices/servicos/" + user.UserId + "?format=json",
			crossDomain : true,
			async : false,
			dataType : 'jsonp',
			success : function(servicos) {
				for (var i = 0, j = servicos.length; i < j; i++) {
					if (servicos[i].id_servico === "1" && servicos[i].status === "True") {
						//Habilita o chat
						$('.chat').live('click', function() {
							$("#chat-box-header").trigger('click');
						});
						//Configura e inicializa o chat
						LCSKChat.config({
							opId : user.UserId,
							headerBackgroundColor : chat.headerBackgroundColor,
							headerTextColor : chat.headerTextColor,
							headerBorderColor : chat.headerBorderColor,
							headerGradientStart : chat.headerGradientStart,
							headerGradientEnd : chat.headerGradientEnd,
							boxBorderColor : chat.boxBorderColor
						});
						LCSKChat.init();
					}
				}
			}
		});

	});
});

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

//Função que retorna data atual
function dataAtual() {
	var fullDate = new Date()
	//Thu May 19 2011 17:25:38 GMT+1000 {}
	//convert month to 2 digits
	var twoDigitMonth = ((fullDate.getMonth().length + 1) === 1) ? (fullDate.getMonth() + 1) : '0' + (fullDate.getMonth() + 1);
	var currentDate = fullDate.getDate() + "/" + twoDigitMonth + "/" + fullDate.getFullYear();
	return currentDate;
}

//Adiciona ao jquery função de serialização de objetos
$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

//Função de filtros de ano
function filtroAnoInicial() {
	var anoAtual = new Date().getFullYear() + 1;
	var anos = [];
	for (var i = anoAtual, j = 1930; i >= j; i--) {
		var ano = {
			id : i,
			group : "anoIni",
			label : i
		};
		anos.push(ano);
	}
	$(".filtroListar .btn-toolbar").append($("#dropdownBaseTmpl").tmpl({
		label : "Ano de",
		id : "dropAnoIni"
	}));
	for (var i = 0, j = anos.length; i < j; i++)
		$(".filtroListar .btn-toolbar #dropAnoIni ul").append($('#dropdownItemTmpl').tmpl(anos[i]));

}

//Função de filtros de ano
function filtroAnoFinal() {
	var anoAtual = new Date().getFullYear() + 1;
	var anos = [];
	for (var i = anoAtual, j = 1930; i >= j; i--) {
		var ano = {
			id : i,
			group : "anoFim",
			label : i
		};
		anos.push(ano);
	}
	$(".filtroListar .btn-toolbar").append($("#dropdownBaseTmpl").tmpl({
		label : "Até",
		id : "dropAnoFim"
	}));
	for (var i = 0, j = anos.length; i < j; i++)
		$(".filtroListar .btn-toolbar #dropAnoFim ul").append($('#dropdownItemTmpl').tmpl(anos[i]));

}
