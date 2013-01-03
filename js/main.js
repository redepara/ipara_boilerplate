function helperSetUserId(userId) {
	ipara.Usuario.userid = userId;
}

function helperSetDestaques(destaques) {
	ipara.Anuncio.destaques = destaques;
}

(function() {

	//Pega o userid a partir do username
	ipara.Usuario.getUserId = function(callback) {
		var userId = "";
		$.ajax({
			url : "http://www.ipara.com.br/iParaServices/usuario/" + ipara.Usuario.username + "?format=json",
			crossDomain : true,
			async : false,
			dataType : 'jsonp',
			success : function(usuario) {
				var userId = usuario.UserId;
				callback(userId);
			}
		});
	};

	//Pega os anúncios em destaque
	ipara.Anuncio.getDestaques = function(qtde, callback) {
		$.ajax({
			url : "http://www.ipara.com.br/iparaServices/imoveis/destaques/" + qtde + "/" + ipara.Usuario.userid + "?format=json",
			crossDomain : true,
			beforeSend:function(){ipara.Usuario.getUserId(helperSetUserId);},
			async : false,
			dataType : 'jsonp',
			success : function(destaques) {
				console.log(destaques);
				var returnDestaques = destaques;
				callback(returnDestaques);
			}
		});
	};

})();