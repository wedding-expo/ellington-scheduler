{*
Copyright 2011-2013 Nick Korbel

Ce fichier fait parti de phpScheduleIt.

phpScheduleIt est un logiciel libre : vous pouvez le redistribuer et/ou le
modifier dans le respect des termes de la license GNU (General Public License)
telle que publiée par la Free Software Foundation, que ce soit en version 3 
de cette license ou plus récente (à votre guise).

phpScheduleIt est distribué dans l'espoir d'être utile mais
il est fourni SANS AUCUNE GARANTIE; sans même une garantie implicite 
de COMMERCIABILITE ou DE CONFORMITE A UNE UTILISATION PARTICULIERE.
Voir la Licence Publique Générale GNU pour plus de détails.

Vous devez avoir reçu une copie de la GNU General Public License
avec phpScheduleIt. si ce n'est pas le cas consultez <http://www.gnu.org/licenses/>.
*}
{include file='..\..\tpl\Email\emailheader.tpl'}
	Details de la réservation:
	<br/>
	<br/>
	
	Début: {formatdate date=$StartDate key=reservation_email}<br/>
	Fin: {formatdate date=$EndDate key=reservation_email}<br/>
	Libellé: {$Title}<br/>
	Description: {$Description|nl2br}<br/>
	
	{if count($RepeatDates) gt 0}
		<br/>
		La réservation se répète aux dates suivantes:
		<br/>
	{/if}
	
	{foreach from=$RepeatDates item=date name=dates}
		{formatdate date=$date}<br/>
	{/foreach}

	{if $RequiresApproval}
		<br/>
		Une ou plusieurs ressources réservées nécessitent une approbation. Cette réservation sera donc provisoirement mise en attente puis un administrateur la validera (ou non)
	{/if}
	
	<br/>
	Confirmer votre présence? <a href="{$ScriptUrl}/{$AcceptUrl}">Oui</a> <a href="{$ScriptUrl}/{$DeclineUrl}">Non</a>
	<br/>

	<a href="{$ScriptUrl}/{$ReservationUrl}">Voir cette réservation</a> |
	<a href="{$ScriptUrl}/{$ICalUrl}">Ajouter à Outlook</a> |
	<a href="{$ScriptUrl}">Connexion à phpScheduleIt</a>
	
{include file='..\..\tpl\Email\emailfooter.tpl'}