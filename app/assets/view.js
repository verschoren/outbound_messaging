var client = ZAFClient.init();

$('.toggle').click(function(){
    $('.toggle').toggleClass('hidden');
    $('#metadata').toggleClass('hidden');
    client.invoke('resize', { width: '100%', height: '100vh' });
}); 

//All View Logic
function setButtons(metadata,context){
    if (context.location == 'user_sidebar'){
        $('.textarea').addClass('hidden');
        $('.buttons').addClass('relative');
        $('.buttons').removeClass('absolute');
        $('#send_message').addClass('hidden');
        $('#send_template_2').addClass('rounded-l-md');
    }
    if (metadata.settings.template_1 != ''){
        $('#send_template_1').html(metadata.settings.template_1);
    } else {
        $('#send_template_1').addClass('hidden');
    }
    if (metadata.settings.template_2 != ''){
        $('#send_template_2').html(metadata.settings.template_2);
    } else {
        $('#send_template_2').addClass('hidden');
    }
}

function setView(integration_id,messaging_id,conversation_id,phone,recipient){
    $('#results').append(`
        <div class="mt-4">
            <strong>Integration ID</strong>
            <pre class="text-sm" id="integration_id">${integration_id}</pre>  
        </div>
    `);
    $('#results').append(`
        <div class="mt-4">
            <strong>Messaging ID</strong>
            <pre class="text-sm" id="messaging_id">${messaging_id}</pre>
        </div>
    `);
    $('#results').append(`
        <div class="mt-4">
            <strong>Conversation ID</strong>
            <pre class="text-sm" id="conversation_id">${conversation_id}</pre>
        </div>
    `);
    $('#phone').html(phone.replaceAll(' ', ''));
    $('#identities').html(JSON.stringify(recipient.identities,null, 2));
}