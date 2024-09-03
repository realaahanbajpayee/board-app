import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Board } from '../../models/board.model';
import { Column } from '../../models/column.model';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrl: './main-view.component.css'
})
export class MainViewComponent {
    board: Board;
    newTask: string[] = [];
    selectedTask: { columnIndex: number, taskIndex: number } | null = null;
    editedTask: string = '';

    constructor(private snackBar: MatSnackBar) {
        this.board = this.loadBoardFromLocalStorage() || new Board('Test Board', [
            new Column('Ideas', [
                "Some random idea",
                "This is another random idea",
                "build an awesome application"
            ]),
            new Column('Research', [
                "Lorem ipsum",
                "foo",
                "This was in the 'Research' column"
            ]),
            new Column('Todo', [
                'Get to work',
                'Pick up groceries',
                'Go home',
                'Fall asleep'
            ]),
            new Column('Done', [
                'Get up',
                'Brush teeth',
                'Take a shower',
                'Check e-mail',
                'Walk dog'
            ])
        ]);

        this.newTask = this.board.columns.map(() => '');
    }

    ngOnInit() {
        // Check if local storage is available
        if (!this.isLocalStorageAvailable()) {
            this.openSnackBar('Local storage is not available. Changes will not be saved.');
        }
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
        this.saveBoardToLocalStorage();
    }

    addColumn() {
        const newColumnName = prompt("Enter the name of the new column:");
        if (newColumnName) {
            this.board.columns.push(new Column(newColumnName, []));
            this.newTask.push('');
            this.saveBoardToLocalStorage();
        }
    }

    deleteColumn(index: number) {
        this.board.columns.splice(index, 1);
        this.newTask.splice(index, 1);
        this.saveBoardToLocalStorage();
    }

    addTask(columnIndex: number) {
        const task = this.newTask[columnIndex].trim();
        if (task) {
            this.board.columns[columnIndex].tasks.push(task);
            this.newTask[columnIndex] = '';
            this.saveBoardToLocalStorage();
        }
    }

    openEditDeleteModal(columnIndex: number, taskIndex: number) {
        this.selectedTask = { columnIndex, taskIndex };
        this.editedTask = this.board.columns[columnIndex].tasks[taskIndex];
    }

    saveTask() {
        if (this.selectedTask !== null) {
            const { columnIndex, taskIndex } = this.selectedTask;
            this.board.columns[columnIndex].tasks[taskIndex] = this.editedTask;
            this.saveBoardToLocalStorage();
            this.closeModal();
        }
    }

    deleteTask() {
        if (this.selectedTask !== null) {
            const { columnIndex, taskIndex } = this.selectedTask;
            this.board.columns[columnIndex].tasks.splice(taskIndex, 1);
            this.saveBoardToLocalStorage();
            this.closeModal();
        }
    }

    closeModal() {
        this.selectedTask = null;
        this.editedTask = '';
    }

    private saveBoardToLocalStorage() {
        if (this.isLocalStorageAvailable()) {
            localStorage.setItem('kanban-board', JSON.stringify(this.board));
        }
    }

    private loadBoardFromLocalStorage(): Board | null {
        if (this.isLocalStorageAvailable()) {
            const boardJson = localStorage.getItem('kanban-board');
            if (boardJson) {
                return JSON.parse(boardJson) as Board;
            }
        }
        return null;
    }

    private isLocalStorageAvailable(): boolean {
        try {
            const testKey = '__test-local-storage__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    private openSnackBar(message: string) {
        this.snackBar.open(message, 'Close', {
            duration: 5000,
        });
    }
}
