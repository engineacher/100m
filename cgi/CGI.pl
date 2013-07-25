#!C:\Strawberry\perl\bin\perl.exe

use CGI;
use strict;
use Data::Dump qw(dump);
my $http = CGI->new;
my $pref = $http->param('pref');

open(FH, "<../htdocs/100m/data.txt");
my @array = <FH> ;
close FH;

#ヘッダ出力
print $http->header;

#データ出力
if($pref eq 'row'){
	print $array[0];
}
elsif($pref eq 'col'){
	print $array[1];
}
else{
	print "Plz select 'row' or 'col'"
}

print dump($http);
print dump(@array);

