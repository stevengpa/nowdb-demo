var socket = io.connect('http://localhost:4545');

var $doc = $(document);
var $name = $doc.find('.name');
var $click = $doc.find('.btn-click');
var $counter = $doc.find('.counter');
var $tblRows = $doc.find('.t-body');
var $brandName = $doc.find('.brand-name');

var counter = 0;

$brandName.on('click', function(e) {
	e.preventDefault();
	socket.emit('reset');
});

$click.on('click', function () {
	var name = $name.val();
	if (name.length > 0) {
		socket.emit('click', { user: name });
	} else {
		alert('Please enter a name');
	}
});

function appendRow(order, row) {
	$tblRows.append(
		'<tr>' +
			'<td>' + order + '</td>' +
			'<td>' + row.player + '</td>' +
			'<td>' + row.date + '</td>' +
		'<tr>'
	);
}

socket.on('init', function (data) {
	var order = 1;
	$tblRows.text('');
	data.map((transaction) => appendRow(order++, transaction));
});

socket.on('new', function (data) {
	appendRow(counter++, data);
});

socket.on('count', function (count) {
	counter = count;
	$counter.text(count);
});
