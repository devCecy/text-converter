import styles from "@/styles/Home.module.css";
import React, { useEffect, useState } from "react";

// libraries
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import useUndo from "use-undo";
import { apiByAxios } from "./api/hello";

// 특수문자, 괄호, 점 모두 제거 - 공백은 제거 안함
let reg = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gim;

interface HistoryProps {
	before: string;
	after: string;
	isLiked: boolean;
}
export default function Home() {
	const [inputValue, setInputValue] = useState("");
	const [inputResult, setInputResult] = useState("");
	// const [history, setHistory] = useState<HistoryProps[]>([]);
	// const [undo, setUndo] = useState<HistoryProps[]>([]);
	// const [redo, setRedo] = useState<HistoryProps[]>([]);

	const [
		historyState,
		{
			set: setHistory,
			// reset: resetCount,
			undo: undoHistory,
			redo: redoHistory,
			canUndo,
			canRedo,
		},
	] = useUndo<HistoryProps[]>([]);
	const { present: history } = historyState;

	/**
	 * 변환 버튼을 클릭합니다.
	 * 텍스트는 10자까지만 입력가능합니다.
	 * @param e
	 */
	const handleTransform = () => {
		// 텍스트 길이 제한 10자
		if (inputValue.length > 10) return alert("10자까지만 입력 가능해요!");
		if (inputValue.length === 0) return alert("텍스트를 입력해주세요!");

		setInputResult(handleReverseString(inputValue));
		setHistory([
			...history,
			{
				before: inputValue,
				after: handleReverseString(inputValue),
				isLiked: false,
			},
		]);
	};

	/**
	 * 텍스트를 뒤집습니다.
	 * @param value
	 * @returns
	 */
	const handleReverseString = (value: string) => {
		return value.split("").reverse().join("");
	};

	/**
	 * 좋아요를 클릭하거나 취소합니다.
	 */
	const handleLike = (e: React.MouseEvent<HTMLDivElement>) => {
		const targetIdx = Number(e.currentTarget.id);
		const newObj = {
			...history[targetIdx],
			isLiked: !history[targetIdx].isLiked,
		};

		const newHistoryList = [
			...history.slice(0, targetIdx),
			newObj,
			...history.slice(targetIdx + 1),
		];

		setHistory([...newHistoryList]);
	};

	/**
	 * 히스토리를 삭제합니다.
	 */
	const handleDelete = (e: React.MouseEvent<HTMLParagraphElement>) => {
		const newHistoryList = [
			...history.slice(0, Number(e.currentTarget.id)),
			...history.slice(Number(e.currentTarget.id) + 1),
		];

		setHistory([...newHistoryList]);
		// setUndo([...undo, history[Number(e.currentTarget.id)]]); // 가장 먼저 삭제된게 0번 인덱스임
	};

	/**
	 * 사용자기록 삭제 실행취소 (undo)
	 */
	const handleUndo = () => {
		// undo 리스트가 비어있다면 실행안됨
		// if (undo.length === 0) return;
		// const copiedUndo = [...undo];
		// copiedUndo.pop();
		// setHistory([...history, undo[undo.length - 1]]);
		// setUndo([...copiedUndo]);
		// if (redo !== undefined && redoObj !== undefined)
		// 	return setRedo([...redo, redoObj]);
	};

	/**
	 * redo
	 */
	const handleRedo = () => {
		// if (redo.length === 0) return;
		// const newHistoryList = [...history];
		// newHistoryList.pop();
		// let newRedo = [...redo];
		// redo.pop();
		// setHistory([...newHistoryList]);
		// if (undo !== undefined && undoObj !== undefined)
		// 	return setUndo([...undo, undoObj]);
		// setRedo([...newRedo]);
	};

	/**
	 * ctl+z / cmd+z
	 * @param e
	 * @returns
	 */
	const handleDetectUndo = (e: any) => {
		if ((e.ctrlKey || e.keyCode === 90) && e.key === "z") return undoHistory();
	};

	useEffect(() => {
		apiByAxios().then((res) => console.log("res", res));

		document.addEventListener("keydown", handleDetectUndo);
		return () => {
			document.removeEventListener("keydown", handleDetectUndo);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<section className={styles.section} onKeyDown={handleDetectUndo}>
			<div className={styles.flex}>
				<div className={styles.textareaBox}>
					<label>사용자입력 - {inputValue.length}/10</label>

					<textarea
						className={styles.textarea}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value.replace(reg, ""))}
					/>
				</div>
				<div className={styles.textareaBox}>
					<label>결과물</label>
					<textarea readOnly className={styles.textarea} value={inputResult} />
				</div>
			</div>
			<div className={styles.flex}>
				<button className={styles.button} onClick={handleTransform}>
					변환
				</button>

				<div className={styles.flexColumn}>
					<div className={styles.buttonBox}>
						<button key="undo" onClick={undoHistory} disabled={!canUndo}>
							undo
						</button>
						<button key="redp" onClick={redoHistory} disabled={!canRedo}>
							redo
						</button>
					</div>
					{history.length > 0 && (
						<div className={styles.history}>
							<label>사용자 입력 기록</label>
							<ul>
								{history.map((item, idx) => {
									return (
										<div className={styles.historyBox} key={idx}>
											{item.isLiked ? (
												<div
													className="iconBox"
													id={String(idx)}
													onClick={handleLike}
												>
													<AiFillHeart style={{ pointerEvents: "none" }} />
												</div>
											) : (
												<div
													className="iconBox"
													id={String(idx)}
													onClick={handleLike}
												>
													<AiOutlineHeart style={{ pointerEvents: "none" }} />
												</div>
											)}

											<li className={styles.historyList}>
												{item.before} {`->`} {item.after}
											</li>
											<p
												id={String(idx)}
												className={styles.deleteBtn}
												onClick={handleDelete}
											>
												x
											</p>
										</div>
									);
								})}
							</ul>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
