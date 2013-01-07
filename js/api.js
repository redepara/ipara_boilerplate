// codigo boilerplate base
// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
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
      offset: {
        top: function () { return $window.width() <= 980 ? 290 : 210 }
      , bottom: 270
      }
    });
    
    //Carrega os templates e adiciona o body
    $.get('tmpl/_ipara.tmpl.htm', function(templates) {
		$('body').append(templates);
	}); 
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
			url : "http://www.ipara.com.br/iparaServices/imoveis/"+userid+"?format=json",
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
	
	//Carrega lista de anúncios de acordo com a página
	ipara.carregaListar = function(pagina) {
		
		//Adiciona a area de paginação
		$("#iparaListar").append('<div class="pagination"></div>');
		
		var userid = ipara.getUserId();
		userid.success(function(data) {
			var totalAnuncios = ipara.getTotalAnuncios(data.UserId);
			totalAnuncios.success(function(total){
				
				$(".pagination").paging(total, {// pagina pelo total de veiculos
					format : '[< ncnnn! >]', // define navegação
					perpage : conf.anunciosPorPagina, // elementos por página
					lapping : 0,
					page : pagina, // página inicial
					onSelect : function(page) {
						var pagina = (this.slice[0] / conf.anunciosPorPagina) + 1;
						$.ajax({
							url : "http://www.ipara.com.br/iparaServices/imoveis/page/pagesize/"+pagina+"/"+conf.anunciosPorPagina+"/"+data.UserId+"/?format=json",
							crossDomain : true,
							async : false,
							dataType : 'jsonp',
							success : function(anuncios) {
								var inner = '<div class="row"></div>';
								$('#iparaListar').append(inner);
								
								//Limpar lista atual de itens
								$("#iparaListar .row").html('');
								//Carregando itens do listar de acordo com o template
								for (var i = 0, j = anuncios.length; i < j; i++) {
									var html = anuncios[i].descricao;
									var div = document.createElement("div");
									div.innerHTML = html;
									var texto = div.textContent || div.innerText || "";
									anuncios[i].descricao = texto;
									$('#listarItemTmpl').tmpl(anuncios[i]).appendTo("#iparaListar .row");
								}
							}
						});
					},
					onFormat : formatPagination
				}); 

				
			});
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
					return '<li><a class="link" href="#">' + this.value + '</a></li>';
				if (!this.active)
					return '';
				return '<li><a class="link" href="#">' + this.value + '</a></li>';
			case 'next':
				// >
				if (this.active)
					return '<li><a class="link" href="#">Próximo</a></li>';
				return '<li><a class="link" href="#">Próximo</a></li>';
			case 'prev':
				// <
				if (this.active)
					return '<li><a class="link" href="#">Anterior</a></li>';
				return '<li><a class="link" href="#">Anterior</a></li>';
			case 'first':
				// [
				if (this.active)
					return '<li><a class="link" href="#">Primeiro</a></li>';
				return '<li><a class="link" href="#">Primeiro</a></li>';
			case 'last':
				// ]
				if (this.active)
					return '<li><a class="link" href="#">Último</a></li>';
				return '<li><a class="link" href="#">Último</a></li>';
		}
	}
