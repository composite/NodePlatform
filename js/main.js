/**
 * 메인 스크립트
 * 
 */
;$(function(){

    // Message Box
	function msgbox(content, title, buttons){
		$('#modalContent').html(content);
		$('#modalTitle').html(title);
		$modal = $('#commonMotal');
		buttons = buttons || {};

		var $btns = $modal.find('#modalButtons>button').not('#closeButton').remove().end().end();
		for(var label in buttons){
			if(label=='close'){
				$('#closeButton')[!!buttons[label] ? 'show' : 'hide']();
				continue;
			}
			var $btn = $('<button type="button" class="btn btn-gray btn-flat btn-rect btn-small" ></button>')
			.text(label)
			.click(buttons[label])
			.appendTo($btns);
		}

        if(!msgbox.instance){
            jui.ready([ "ui.modal" ], function(modal) {
                msgbox.instance = modal("#commonMotal", {
                    color: "black"
                });
                msgbox.close = function(){
                    msgbox.instance.hide();
                };
                $modal.find('#closeButton').on('click', msgbox.close);
                msgbox.instance.show();
            });
        }else{
            msgbox.instance.show();
        }

	} msgbox.close = function(){};

    require('nw.gui').Window.get().on('close', function() {
        if (!(commit.insert.length + commit.update.filter(function(a){return a;}).length + commit.remove.length) || confirm('Are you sure to exit?\nUnsaved data will be lost.')) {
            this.close(true);
        }
    });


	//공통코드
	var gender = ['남', '여']
	,part = ['총무팀','인사팀','영업팀','개발팀','홍보팀','경영지원팀']
	,rank = ['사원','주임','대리','과장','팀장'];

	//내장 DB 초기화 및 테이블 생성
	var db = new Database('demo_insa')
	,commit = {
        list:[],   //데이터 원본
		insert:[], //신규 대상
		update:[], //수정 대상
		remove:[]  //삭제 대상
	};

    //DB 초기화
	db.then(function(){
		//테이블 정의
		db.query('CREATE TABLE IF NOT EXISTS insa(id INTEGER PRIMARY KEY ASC, name TEXT, gender TEXT, city TEXT, age INTEGER, part TEXT, rank TEXT, "join" DATETIME)')
		.then(function(){
				//데이터 확인 후 없으면 기본 데이터 넣기
				db.query("SELECT COUNT(*) AS cnt FROM insa")
				.then(function(rs){
					if(!rs.rows.length || !rs.rows.item(0).cnt){
						db.begin();
						getData().forEach(function(data){
							var kv={para:[], value:[]};
							for(var col in data){
								kv.para.push('?');
								kv.value.push(data[col]);
							}
							db.query.apply(db, ["INSERT INTO insa VALUES ("+kv.para.join(',')+")"].concat(kv.value.slice()));
						});
						db.execute(function(){
								//새로고침
								$('#btn_cancel').click();
							});
					}else{
							//새로고침
							$('#btn_cancel').click();
						}
						
					});
			});
	});

    //그리드 처리
    jui.ready([ "util.base", "ui.dropdown", "uix.table" ], function(_, dropdown, table) {
        var grid = table("#myGrid", {
            fields: [ "name", "gender", "city", "age", "part", "rank", "join" ],
            scroll: true,
            resize: true,
            colshow: true,
            sort: true,
            editRow: true,
            event: {
                //클릭시 행 선택
                click: function(row, e) {
                    if($(row.element).hasClass("checked")) {
                        this.uncheck(row.index);
                    } else {
                        this.check(row.index);
                    }
                },
                editstart: function(row) {
                    row.element.cells[0].firstChild.select();
                    //편집모드 활성화
                    $('#btn_insert').data('EDIT_FREEZE', true);
                },
                editend: function(row) {
                    //편집모드 비활성화
                    $('#btn_insert').data('EDIT_FREEZE', false);
                }
            }
        });

        $(window).on('resize', function(){
            grid.scroll($('#myGrid').map(function(){return $(this).outerHeight() - $(this).find('thead').outerHeight();}).get(0));
        }).trigger('resize');

        // 검색 시 필터링 작동
        $('#search_form').submit(function(e){
            e.preventDefault();
            var search = this.elements.search, val = search.value;

            grid.update(val ? commit.list.filter(function(item){return !!~item.name.indexOf(val);}) : commit.list);

            return false;
        })[0].elements.search.focus();

        //EXCEL DOWNLOAD
        $('#btn_excel').on('click', function(){
            $('#excelDownAs').on('change', function(){
                console.log(this.value);
                require('fs').writeFileSync(this.value, grid.getCsv());
                $(this).val('');
            }).click();
        });


        //신규 버튼
        $('#btn_insert').click(function(){
            //편집중에는 제외
            if ($('#btn_insert').data('EDIT_FREEZE')) {
                return;
            }

            var now = new Date(),
                data = {
                    "id": now.getTime(),
                    "name": "새 이름",
                    "city": "서울",
                    "gender": "남",
                    "age": 20,
                    "part": "총무팀",
                    "rank": "사원",
                    "join": [now.getFullYear(), ('00'+(now.getMonth()+1)).slice(-2), ('00'+(now.getDate())).slice(-2)].join('-'),
                    "isNew": true //DB에 없는 값 의미
                };

            //신규 저장에 삽입
            commit.insert.push(data);
            //원본 데이터에 삽입
            commit.list.push(data);
            //그리드에도 삽입
            grid.append(data);
            //강제 입력모드 전환
            grid.showEditRow(grid.count() - 1, 1);
            //스크롤해야됨 -_-
            $('#myGrid').find('tbody').each(function(){this.scrollTop = this.scrollHeight;});
        });
        //삭제 버튼
        $('#btn_delete').click(function(){
            //선택된 위치 수집
            var selectedRows = grid.listChecked();

            if(!selectedRows.length){
                msgbox('Please select row for delete.', 'Remove', {close:true});
                return;
            }

            //선택된 위치의 값 수집
            selectedRows.forEach(function(row){
                var item = row.data;
                if(item){
                    if(!item.isNew){
                        //DB에 있는 항목만 삭제 대기열 추가
                        commit.remove.push(item);
                    }

                    //삽입 및 수정 대기열 있으면 삭제
                    var idx;
                    if(~(idx=commit.insert.indexOf(item))){
                        commit.insert.splice(idx, 1);
                    }
                    if(~(idx=commit.update.indexOf(item))){
                        commit.update.splice(idx, 1);
                    }
                }
                //그리드에서 삭제
                grid.remove(row.rownum);
                //원본에서도 삭제
                commit.list.splice(commit.list.indexOf(item),1);

            });

        });
        //저장 버튼
        $('#btn_save').click(function(){

            //편집 모드 비활성화
            var editrow = grid.getEditRow();
            if(editrow){
                grid.hideEditRow(editrow.rownum);
            }

            //UPDATE 는 쓰레기 값이 들어가 있기 때문에 필터링 후 개수 세기.
            if(!(commit.insert.length + commit.update.filter(function(a){return a;}).length + commit.remove.length)){
                msgbox('Nothing changed.', 'Save', {close:true});
                return;
            }else if(!confirm('Are you sure to save?')){
                return;
            }

            db.begin();
            //삽입
            commit.insert.forEach(function(item){
                if(!item){return;}
                db.query(
                    "INSERT INTO insa VALUES (?,?,?,?,?,?,?,?)",
                    item.id,
                    item.name,
                    item.gender,
                    item.city,
                    item.age,
                    item.part,
                    item.rank,
                    item.join
                );
            });
            //수정
            commit.update.forEach(function(item){
                if(!item){return;}
                var q = [
                    'UPDATE insa SET',
                    '	 name = ? ',
                    '	,gender = ? ',
                    '	,city = ? ',
                    '	,age = ? ',
                    '	,part = ? ',
                    '	,rank = ? ',
                    '	,"join" = ? ',
                    ' WHERE id = ?'
                ].join('\n');
                var values=[];
                db.query(
                    q,
                    item.name,
                    item.gender,
                    item.city,
                    item.age,
                    item.part,
                    item.rank,
                    item.join,
                    item.id
                );
            });
            //삭제
            commit.remove.forEach(function(item){
                if(!item){return;}
                if(item && !isNaN(item.id)){
                    db.query("DELETE FROM insa WHERE id = ?", item.id);
                }
            });
            //트랜잭션 실행
            db.execute(function(){
                //어자피 새로고침 할거니 취소버튼 기능 실행
                $('#btn_cancel').click();
            });
            beforeProcess(true);
            afterProcess.isSave = true;
        });
        //취소 버튼
        $('#btn_cancel').click(function(){
            // 변경내역 삭제
            for(var tn in commit){
                commit[tn].length = 0;
            }
            //다시 조회 실시
            db.query("SELECT * FROM insa").then(function(rs){
                commit.list = [];
                for(var i=0,len=rs.rows.length;i<len;i++){
                    var row = rs.rows.item(i), item = {};
                    //row 객체 항목들이 읽기 전용이므로 쓰기 가능하도록 객체 복사
                    //이거 안하면 수정이 안됨.
                    for(var col in row){
                        Object.defineProperty(item,col,{
                            __proto__: null,
                            value: row[col],
                            writable: true,
                            enumerable: true,
                            configurable: false
                        });
                    }
                    commit.list.push(item);
                }
                grid.update(commit.list);
                afterProcess();
            });
            beforeProcess();
        });
        //불러오거나 저장하기 전 프로세스
        function beforeProcess(save){
            if(beforeProcess.called){
                return;
            }else{
                beforeProcess.called = true;
            }
            $('button').prop('disabled',true);
            if(save){
                msgbox('Saving...', 'Save', {close:false});
            }
        }
        //불러오거나 저장한 후 프로세스
        function afterProcess(){

            $('button').prop('disabled',false);
            beforeProcess.called = false;

            if(afterProcess.isSave){
                msgbox('Saved successfully.', 'Save', {close:true});
                afterProcess.isSave = false;
            }else{
                msgbox.close();
            }
        }

    });

	//그리드 열 정의
	/*var grid;
	var columns = [
	{id: "name", name: "이름", field: "name", width: 100, cssClass:'tc', headerCssClass:'tc', editor: Slick.Editors.Text},
	{id: "gender", name: "성별", field: "gender", width: 50, cssClass:'tc', headerCssClass:'tc', editor: Slick.Editors.Select(gender), cannotTriggerInsert: true},
	{id: "city", name: "주소", field: "city", width: 50, cssClass:'tc', headerCssClass:'tc', editor: Slick.Editors.Text, cannotTriggerInsert: true},
	{id: "age", name: "나이", field: "age", width: 50, cssClass:'tc', headerCssClass:'tc', editor: Slick.Editors.Type('number'), cannotTriggerInsert: true},
	{id: "part", name: "부서", field: "part", width: 50, cssClass:'tc', headerCssClass:'tc', editor: Slick.Editors.Select(part), cannotTriggerInsert: true},
	{id: "rank", name: "직급", field: "rank", width: 50, cssClass:'tc', headerCssClass:'tc', editor: Slick.Editors.Select(rank), cannotTriggerInsert: true},
	{id: "join", name: "입사일", field: "join", width: 100, cssClass:'tc', headerCssClass:'tc', editor: Slick.Editors.Type('date'), cannotTriggerInsert: true}
	];*/


});