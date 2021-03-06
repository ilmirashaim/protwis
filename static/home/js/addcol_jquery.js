
$(document).ready(function () {

addaux('aux_proteins');
addRow('chem_comp');

 $('.datepicker').datepicker({
     inline: true,
    showOtherMonths: true
 });

$('.numeric').keyup(function () { 
    this.value = this.value.replace(/[^0-9\.]/g,'');
});

$(".searchclear").on('click',function(){
    $(this).prev('input').val("");
});

$('#xtals_form').validate({ // initialize the plugin
            rules: {
            name_cont: {
                required: true,
                //email: true
            },  
            pi_name: {
                required: true,  
            }
        },

         messages: {   //customize messages
            name_cont: {
                required: "You must enter your full name",
                //email: true
            },
            pi_name: {
                required: "You must enter the name of your PI leader",
            },
           
        },
    highlight: function(element) {
        $(element).attr("class", $(element).attr("class").replace("tobereplaced", "error"));
    },   
    unhighlight: function(element) {
        $(element).removeClass("error");
    }
    });

//$("input[id*=id_del]").rules("add", "required");    //add rules after validator is initialized
  //$("select").addClass("form-control");
  $(".button").addClass("btn btn-primary"); 
  
      $(".aamod_pos_type").on('change', function () {
        temp_index = $(this).parent().parent().index();     //parent of td is tr
        var aamod_type= ["single", "pair", "range"];
      for (var k=0; k<aamod_type.length; k+=1){
        var aa=aamod_type[k] ;
          if(this.value === aa){
          if (temp_index>1) {
                    $(".aa_type.row_id_"+temp_index).val(''); 
                    $(".aa_type.row_id_"+temp_index).hide(); 
                    $('.'+aa+'.row_id_'+temp_index).show(); 
                  } else {
                    $(".aa_type.row_id_"+temp_index).val(''); 
                    $(".aa_type.row_id").hide(); 
                    $('.'+aa+'.row_id').show(); 
                  }
          }
     }
  });

$(".insert_pos_type").on('change', function () {
        temp_index = $(this).parent().index();     //parent of td is tr
        var insert_type= ["ins_single", "ins_range"];
      for (var k=0; k<insert_type.length; k+=1){
        var ins=insert_type[k] ;
          if(this.value === ins){
          if (temp_index>1) {
                    $(".ins_pos_type.col_id_"+temp_index).val('');
                    $(".ins_pos_type.col_id_"+temp_index).hide(); 
                    $('.'+ins+'.col_id_'+temp_index).show(); 
                  } else {
                    $(".ins_pos_type.col_id").val(''); 
                    $(".ins_pos_type.col_id").hide(); 
                    $('.'+ins+'.col_id').show(); 
                  }
          } 
      }
  });

$(".position").on('change', function () {
        temp_index = $(this).parent().index();     
          if(this.value === 'Within Receptor'){
            if (temp_index>1) {
                      $(".with_rec.col_id_"+temp_index).show(); 
                      $(".within_receptor_th").show();
                    } else {
                      $(".with_rec.col_id").show(); 
                      $(".within_receptor_th").show();
                    }
          }   
         else{
             if (temp_index>1) {
                      $(".with_rec.col_id_"+temp_index).prop('selectedIndex',0); 
                      $(".with_rec.col_id_"+temp_index).hide(); 
                      $(".with_rec_val.col_id_"+temp_index).val('');
                      $(".with_rec_val.col_id_"+temp_index).hide();
                      $(".stable.col_id_"+temp_index).show();
                    } 
                    else { 
                      $(".with_rec.col_id").prop('selectedIndex',0); 
                      $(".with_rec.col_id").hide(); 
                      $(".with_rec_val.col_id").val(''); 
                      $(".with_rec_val.col_id").hide();
                      $(".stable.col_id").show();
                    }
         }
  });

var proteins=[ "type", "signal", "tag", "fusion", "linker", "prot_cleavage"];
            $(".protein_type").on('change', function () {
             temp_index = $(this).parent().index();
              for (pos=0; pos<proteins.length; pos+=1){
                var i=proteins[pos] ;
                  if(this.value === i){
                    $(".sub_type").show();       
                    if (temp_index>1) {
                      $('.prot_type.col_id_'+temp_index).hide(); 
                      $('.prot_type.col_id_'+temp_index).val("Please Select"); 
                      $('.others.col_id_'+temp_index).val("");
                      $('.linker.col_id_'+temp_index).val("");
                      $('.'+i+'.col_id_'+temp_index).show();   
                    } else {
                      $('.prot_type.col_id').hide(); 
                      $('.'+i+'.col_id').show();   
                      $(".prot_type.col_id").val('Please Select');   
                      $('.others.col_id').val("");
                      $('.linker.col_id').val("");
                    }
                  }
             }
        });

addLast("#addurl", "#contact_information", "5");
addLast("#add_treatment", "#solubil_purif", "4");

$("#deleteurl").on('click', function() {
  $("#contact_information tr:last").each(function(){
    if ($(this).hasClass("newClass")){
      $(this).remove();
    }
 });
 });

$(".ph").on('change', function () {
  var ph_type= ["single_ph", "range_ph"];
  for (var n=0; n<ph_type.length; n+=1){
      var ph_val=ph_type[n] ;
      if(this.value === ph_val){
        $(".ph_type").val('');
        $(".ph_type").hide();
        $("."+ph_val).show();
      }
  }
});

$(".deletion_type").on('change', function () {
        temp_index = $(this).parent().parent().index();     //parent of td is tr
        var delet_type= ["del_single", "del_range"];
      for (var l=0; l<delet_type.length; l+=1){
        var del=delet_type[l] ;
          if(this.value === del){    
          if (temp_index>1) {
                    $(".del_type.row_id_"+temp_index).val('');
                    $(".del_type.row_id_"+temp_index).hide(); 
                    $('.'+del+'.row_id_'+temp_index).show();
                  } else {
                    $(".del_type.row_id").val(''); 
                    $(".del_type.row_id").hide(); 
                    $('.'+del+'.row_id').show(); 
                  }
          }
     }
  });

showOther('id_detergent','other_det','other [See next field]');
showOther('id_deterg_type','other_type_deterg','other [See next field]');
showOther('id_lcp_lipid','other_lcp','other [See next field]');
showOther('id_crystal_type','other_cryst_type','other [See next field]');
showOther('id_lipid','other_lipid','other [See next field]');
showOther('id_crystal_method','other_method','other [See next field]');
showOther('id_expr_method','other_expr','Other [In case of E.Coli or Yeast recombinant expression]');
showOther('id_host_cell_type','other_host_cell','other [See next field]');
showOther('id_host_cell','host_cell_other','other [See next field]');
showOtherAux('signal','other_signal','Other');
showOtherAux('prot_cleavage','other_prot','Other');
showOtherAux('tag','other_tag','Other');
showOtherChem('chem', 'chem_enz_remark', 'Other [See remark]');
//call delrow for the tables
delRow(".del_delrow", "#deletions");
delRow(".chem_delrow", "#chem_comp");
delRow(".mod_delrow", "#modifications");
delLast(".chem_enz_delrow", "#solubil_purif");

$('.delcol').on('click', function (){
    col_index=$(this).parent().index();      

    if (confirm("Are you sure you want to delete this column?")){
    $("#aux_proteins tr").each(function() {
      $(this).children().eq(col_index).remove();

          console.log("col_index:"+col_index);
          $("#deletions tr").each(function() {
            if ($(this).hasClass("cloned_insertion"+col_index)){
                $(this).remove();
            }
          });
  
    });      
   //udpate the id's  (of all table and originals)
    $('#aux_proteins td').each(function(){
      var my_index=$(this).index();
      $(this).children().each(function(){    
          var out_class=$(this).attr('class').split(' ').pop();
          if (out_class==='col_id'){
          $(this).removeClass(out_class);
          $(this).addClass('col_id');
          }
         else {
          $(this).removeClass(out_class);
          $(this).addClass('col_id_'+my_index);
          }
          if (my_index>1){
          $(this).attr("id", $(this).attr("id").replace(/\d+$/, my_index));
          $(this).attr("name", $(this).attr("name").replace(/\d+$/, my_index));
          }
      });
   });  
   ///update also the cloned td ids classes etc
     $('#aux_proteins td').each(function(){
       var td_class=$(this).attr('class').split(' ').pop();
        if (td_class.match("^klon")){
          console.log(td_class);
          //$("."+td_class).hide();
          klon_td=$(this).index();
          $("#deletions td").each(function(){
              if ( $(this).hasClass(td_class) ){
                del_row_index=$(this).parent().index();
                  var del_class=$(this).attr('class').split(' ').pop();
                  $(this).children().each(function(){
                    //now my this is children of del td
                    //tr index  
                    $(this).attr("class", $(this).attr("class").replace(/\bins_del_single.*?\b/g, 'ins_del_single'+klon_td));
                    $(this).attr("class", $(this).attr("class").replace(/\bins_del_start.*?\b/g, 'ins_del_start'+klon_td));
                    $(this).attr("class", $(this).attr("class").replace(/\bins_del_end.*?\b/g, 'ins_del_end'+klon_td));
                    $(this).attr("class", $(this).attr("class").replace(/\bcol_id.*?\b/g, 'col_id_'+klon_td));
                    $(this).attr("class", $(this).attr("class").replace(/\brow_id.*?\b/g, 'row_id_'+del_row_index));
                    $(this).attr("id", $(this).attr("id").replace(/\d+$/, klon_td));

                    }); //children
                $(this).attr("class", $(this).attr("class").replace(/\bklon.*?\b/g, 'klon'+klon_td));
                $(this).attr("class", $(this).attr("class").replace(/\bklon.*?\b/g, 'klon'+klon_td));
   
                //update the tr cloned insertion class
                $(this).parent().each(function(){
                  $(this).attr("class", $(this).attr("class").replace(/\bcloned.*?\b/g, 'cloned_insertion'+klon_td));   
                  $(this).children().each(function(){
                    if ($(this).is('th')){
                      klon_td_minus=klon_td-1;
                      $(this).text("Del. from Insertion"+klon_td_minus); //update of th
                    }
                });               
                }); 
              }
        }); ///deletions td
          $(this).attr("class", $(this).attr("class").replace(/\bklon.*?\b/g, 'klon'+klon_td));
       }
    });
  }
  else{}
 });

$(".position").on('click',function(){ 
   var my_index=$(this).parent().index();
   console.log("my_index="+my_index);
if (my_index>1){
    $(".insert_pos_type.col_id_"+my_index).one('click',function(){ 
        cur_index=$(this).parent().index();
        actual_index=cur_index-1;
        console.log("my_index="+cur_index);
        console.log("cur_index="+cur_index);
              var insertion= $(this).closest('td');
              insertion.addClass("klon"+insertion.index());
              var insertion_clone=$(insertion).clone(true);
              insertion_clone.find(".insert_pos_type").remove();
              $("#deletions tr:last").after("<tr><th class='cloned_th"+insertion.index()+"'>Del. from Insertion"+actual_index+"</th></tr>");
              $("#deletions tr:last").append(insertion_clone);
              var last_del_index=$("#deletions tr:last").index();
              insertion_clone.parent().addClass("cloned_insertion"+cur_index);
              //avoid duplicates
              $('.cloned_insertion'+cur_index).not(':first').remove();
              $(insertion_clone).each(function(){
                $(this).children().each(function(){
                $(this).addClass("row_id_"+last_del_index); 
                $(this).attr("id", $(this).attr("id").replace(/\d+$/, cur_index));   
                $(this).attr("name", $(this).attr("name").replace(/\d+$/, cur_index));       
                if ($(this).hasClass("ins_start")){
                  $(this).attr("class", $(this).attr("class").replace("ins_start", "ins_del_start"+cur_index));
                }
                else if ($(this).hasClass("ins_end")){
                  $(this).attr("class", $(this).attr("class").replace("ins_end", "ins_del_end"+cur_index));
                }
                else if ($(this).hasClass("ins_single")){
                  $(this).attr("class", $(this).attr("class").replace("to_change", "ins_del_single"+cur_index));
                }
                  });
              });
              $(".ins_start.col_id_"+cur_index).on("keyup paste", function() {
              $(".ins_del_start"+$(this).parent().index()).val($(this).val());
              });
             $('.ins_del_start'+cur_index).keydown(function() {
             return false;
              });
              $(".ins_end.col_id_"+cur_index).on("keyup paste", function() {
              $(".ins_del_end"+$(this).parent().index()).val($(this).val());
              });
             $('.ins_del_end'+cur_index).keydown(function() {
             return false;
              });
              $(".ins_single.col_id_"+cur_index).on("keyup paste", function() {
              $(".ins_del_single"+$(this).parent().index()).val($(this).val());
              });
              $('.ins_del_single'+cur_index).keydown(function() {
              return false;
              });
        });
}
else{
   $(".insert_pos_type.col_id").one('click',function(){ 
      first_index=$(this).parent().index();
      console.log("first index="+first_index);
            var insertion= $(this).closest('td');
            var insertion_clone=$(insertion).clone();
            insertion_clone.find(".insert_pos_type").remove();
            $("#deletions tr:last").after("<tr><th>Del. from Insertion"+first_index+"</th></tr>")
            $("#deletions tr:last").append(insertion_clone);
            var del_index=$("#deletions tr:last").index();
            insertion_clone.parent().addClass("cloned_insertion");
             $('.cloned_insertion').not(':first').remove();
            $(insertion_clone).each(function(){
            $(this).children().each(function(){
            $(this).addClass("row_id_"+del_index);      
            if ($(this).hasClass("ins_start")){
              $(this).attr("class", $(this).attr("class").replace("ins_start", "ins_del_start"+first_index));
            }
           else if ($(this).hasClass("ins_end")){
              $(this).attr("class", $(this).attr("class").replace("ins_end", "ins_del_end"+first_index));
            }
           else if ($(this).hasClass("ins_single")){
              $(this).attr("class", $(this).attr("class").replace("to_change", "ins_del_single"+first_index));
            }
                }); 
        });
            $(".ins_start.col_id").on("keyup paste", function() {
            $(".ins_del_start"+$(this).parent().index()).val($(this).val());
            });
           $('.ins_del_start'+first_index).keydown(function() {
           return false;
            });
            $(".ins_end.col_id").on("keyup paste", function() {
            $(".ins_del_end"+$(this).parent().index()).val($(this).val());
            });
           $('.ins_del_end'+first_index).keydown(function() {
           return false;
            });
            $(".ins_single.col_id").on("keyup paste", function() {
            $(".ins_del_single"+$(this).parent().index()).val($(this).val());
            });
            $('.ins_del_single'+first_index).keydown(function() {
            return false;
            });
      });
  }

});

$(".position").on('change', function(){
  var grab_index=$(this).parent().index();
  console.log("grabbed index="+grab_index);
 if ( $(".insert_pos_type.col_id_"+grab_index).is(":visible") ){
            $(".cloned_insertion"+grab_index).show();
          }
 else {
  $(".cloned_insertion"+grab_index).hide();
  //$("th").hasClass("cloned_th"+grab_index).hide();
 }         
});

$('.checked').on('click', function (){
      if (confirm("Are you sure you want to delete these rows?")){
           $('input:checked').each(function(){
            if ($(this).hasClass('checkrow')){
             $(this).closest('tr').remove();
          $("#mutations"+' tr').each(function(){
            var my_index=$(this).index();
            $(this).children().each(function(){    
              $(this).children().each(function(){   
                  if (my_index>1){
                  var out_class=$(this).attr('class').split(' ').pop();
                  $(this).removeClass(out_class);
                  $(this).addClass('row_id_'+my_index);
                 //update ids and names 
                  $(this).attr("id", $(this).attr("id").replace(/\d+$/, my_index));
                  $(this).attr("name", $(this).attr("name").replace(/\d+$/, my_index));
                      }
                  });
                });
              });
            }
        });
     }
 });

//!!!!! closing of document ready function
});










